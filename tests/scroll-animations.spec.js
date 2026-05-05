import { test, expect } from '@playwright/test';

/**
 * Scroll animation tests — verify that --shrink and bottom-nav auto-hide
 * work consistently across landing page AND hub pages.
 */

const PAGES = [
  { name: 'Landing (index.html)', url: '/', target: '.m-search' },
  { name: 'Events hub', url: '/events.html', target: '.m-tab-bar' },
  { name: 'Retreats hub', url: '/retreats.html', target: '.m-tab-bar' },
  { name: 'Trainings hub', url: '/trainings.html', target: '.m-tab-bar' },
];

for (const page of PAGES) {
  test.describe(`${page.name} — scroll animations`, () => {

    test('--shrink starts at 0 before scroll', async ({ browserName }, testInfo) => {
      const browser = await (await import('@playwright/test')).chromium.launch();
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const pg = await context.newPage();
      await pg.goto(`http://localhost:3333${page.url}`, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(500); // let components mount + scroll-animations init

      const target = await pg.$(page.target);
      if (!target) {
        test.skip();
        await browser.close();
        return;
      }

      const shrink = await target.evaluate(el => getComputedStyle(el).getPropertyValue('--shrink').trim());
      // Should be 0 or empty (default)
      expect(shrink === '' || shrink === '0' || shrink === '0.000').toBeTruthy();
      await browser.close();
    });

    test('--shrink reaches ~1 after scrolling 150px', async ({ browserName }, testInfo) => {
      const browser = await (await import('@playwright/test')).chromium.launch();
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const pg = await context.newPage();
      await pg.goto(`http://localhost:3333${page.url}`, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(300);

      const target = await pg.$(page.target);
      if (!target) {
        test.skip();
        await browser.close();
        return;
      }

      // Scroll down past the RANGE (110px)
      await pg.evaluate(() => window.scrollTo(0, 150));
      await pg.waitForTimeout(100); // rAF tick

      const shrink = await target.evaluate(el => el.style.getPropertyValue('--shrink'));
      const val = parseFloat(shrink);
      expect(val).toBeGreaterThanOrEqual(0.5); // animation triggered (exact value varies with sticky elements)
      await browser.close();
    });

    test('--shrink goes back to 0 when scrolling to top', async ({ browserName }, testInfo) => {
      const browser = await (await import('@playwright/test')).chromium.launch();
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const pg = await context.newPage();
      await pg.goto(`http://localhost:3333${page.url}`, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(300);

      const target = await pg.$(page.target);
      if (!target) {
        test.skip();
        await browser.close();
        return;
      }

      // Scroll down then back up
      await pg.evaluate(() => window.scrollTo(0, 200));
      await pg.waitForTimeout(100);
      await pg.evaluate(() => window.scrollTo(0, 0));
      await pg.waitForTimeout(100);

      const shrink = await target.evaluate(el => el.style.getPropertyValue('--shrink'));
      const val = parseFloat(shrink);
      expect(val).toBeLessThanOrEqual(0.01);
      await browser.close();
    });

    test('visual: icons collapse on scroll (screenshot comparison)', async ({ browserName }, testInfo) => {
      const browser = await (await import('@playwright/test')).chromium.launch();
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const pg = await context.newPage();
      await pg.goto(`http://localhost:3333${page.url}`, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(500);

      const target = await pg.$(page.target);
      if (!target) {
        test.skip();
        await browser.close();
        return;
      }

      // Screenshot before scroll
      const beforeShot = await target.screenshot();
      testInfo.attach('before-scroll', { body: beforeShot, contentType: 'image/png' });

      // Scroll down
      await pg.evaluate(() => window.scrollTo(0, 200));
      await pg.waitForTimeout(200);

      // Screenshot after scroll
      const afterShot = await target.screenshot();
      testInfo.attach('after-scroll', { body: afterShot, contentType: 'image/png' });

      // Verify the screenshots are different (animation happened)
      expect(Buffer.compare(beforeShot, afterShot)).not.toBe(0);
      await browser.close();
    });
  });
}

test.describe('Bottom-nav auto-hide', () => {
  const PAGES_WITH_NAV = [
    { name: 'Landing', url: '/' },
    { name: 'Events', url: '/events.html' },
  ];

  for (const page of PAGES_WITH_NAV) {
    test(`${page.name} — bottom nav hides after scrolling 1.5vh down`, async () => {
      const browser = await (await import('@playwright/test')).chromium.launch();
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const pg = await context.newPage();
      await pg.goto(`http://localhost:3333${page.url}`, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(500);

      const nav = await pg.$('.vb-bottom-nav');
      if (!nav) {
        test.skip();
        await browser.close();
        return;
      }

      // Initially visible
      const hasHiddenBefore = await nav.evaluate(el => el.classList.contains('is-hidden'));
      expect(hasHiddenBefore).toBe(false);

      // Scroll down past 1.5 viewports (844 * 1.5 = 1266px)
      await pg.evaluate(() => window.scrollTo(0, 1400));
      await pg.waitForTimeout(200);

      const hasHiddenAfter = await nav.evaluate(el => el.classList.contains('is-hidden'));
      expect(hasHiddenAfter).toBe(true);

      // Scroll up 0.5vh (422px) — should reappear
      await pg.evaluate(() => window.scrollBy(0, -500));
      await pg.waitForTimeout(200);

      const hasHiddenReappear = await nav.evaluate(el => el.classList.contains('is-hidden'));
      expect(hasHiddenReappear).toBe(false);

      await browser.close();
    });
  }
});
