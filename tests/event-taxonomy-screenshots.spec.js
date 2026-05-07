import { test } from '@playwright/test';

test('screenshots — desktop landing (cat-card area)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/index.html');
  const eventsCard = page.locator('.cat-group', { has: page.locator('h3', { hasText: 'Events' }) });
  await eventsCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-screenshots/events-tax-landing-cards.png', fullPage: false });
});

test('screenshots — search pill events dropdown open', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/index.html');
  await page.click('[data-tab="events"]');
  await page.click('#searchPill .field[data-key="cat"]');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-screenshots/events-tax-search-pill.png', fullPage: false });
});

test('screenshots — mobile modal events cat step', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html');
  await page.click('#mSearchPill');
  await page.locator('#mModalTabs .m-modal-tab', { hasText: 'Events' }).click();
  const collapsedCat = page.locator('#mModal .m-step.collapsed', {
    has: page.locator('.m-step-head span', { hasText: /^What$/ })
  });
  await collapsedCat.click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-screenshots/events-tax-mobile-modal.png' });
});

test('screenshots — events search results filter bar', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/events-search-results.html?pillar=dance&sub=ecstatic-dance');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'test-screenshots/events-tax-search-results.png', fullPage: false });
});

test('screenshots — events search results category picker open', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/events-search-results.html');
  await page.click('#categoryPill');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-screenshots/events-tax-category-picker.png', fullPage: false });
});
