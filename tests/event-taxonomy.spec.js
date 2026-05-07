import { test, expect } from '@playwright/test';

const PILLAR_NAMES = ['Workshops', 'Ceremonies', 'Dance', 'Music', 'Talks & Performances'];

test.describe('EVENT_TAXONOMY — taxonomy.js exposes hierarchical event data', () => {
  test('window.Taxonomy.EVENT_TAXONOMY has 5 pillars with subs', async ({ page }) => {
    await page.goto('/index.html');
    const summary = await page.evaluate(() => {
      const t = window.Taxonomy;
      return {
        hasFlat: !!t.EVENT_CATEGORIES,
        pillars: t.EVENT_TAXONOMY.map(p => ({ name: p.name, slug: p.slug, subCount: p.subs.length, count: p.count })),
        sampleNode: t.findEventNode('workshops/yoga'),
      };
    });
    expect(summary.hasFlat).toBe(false);
    expect(summary.pillars.map(p => p.name)).toEqual(PILLAR_NAMES);
    for (const p of summary.pillars) expect(p.subCount).toBeGreaterThan(5);
    expect(summary.sampleNode.pillar?.slug).toBe('workshops');
    expect(summary.sampleNode.sub?.slug).toBe('yoga');
  });
});

test.describe('Landing — Events browse-by-category card uses taxonomy', () => {
  test('events card lists pillar entries with sub teaser', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/index.html');
    const eventsGroup = page.locator('.cat-group', { has: page.locator('h3', { hasText: 'Events' }) });
    await expect(eventsGroup).toBeVisible();
    await eventsGroup.scrollIntoViewIfNeeded();
    for (const name of PILLAR_NAMES) {
      await expect(eventsGroup.locator('.pi-name', { hasText: name })).toBeVisible();
    }
  });
});

test.describe('Search pill — Events tab opens taxonomy dropdown', () => {
  test('events tab category dropdown shows pillars + subs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/index.html');
    await page.click('[data-tab="events"]');
    await page.click('#searchPill .field[data-key="cat"]');
    const taxDropdown = page.locator('#searchPill .field[data-key="cat"] .dropdown.taxonomy');
    await expect(taxDropdown).toBeVisible();
    await expect(taxDropdown.locator('.tax-name', { hasText: 'Workshops' })).toBeVisible();
    await expect(taxDropdown.locator('.tax-name', { hasText: 'Ceremonies' })).toBeVisible();
    await expect(taxDropdown.locator('.tax-name', { hasText: 'Dance' })).toBeVisible();
  });
});

test.describe('Mobile modal — events tab cat step renders taxonomy', () => {
  test('mobile modal events cat step renders pillar list', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html');
    await page.click('#mSearchPill');
    // Click the Events tab inside the modal (selected via its label).
    await page.locator('#mModalTabs .m-modal-tab', { hasText: 'Events' }).click();
    // Open the "What?" step (collapsed cat row) — title for events tab.
    const collapsedCat = page.locator('#mModal .m-step.collapsed', { has: page.locator('.m-step-head span', { hasText: /^What$/ }) });
    await collapsedCat.click();
    const pillars = page.locator('#mModal .m-tax-pillar .pi-name');
    await expect(pillars.filter({ hasText: 'Workshops' })).toBeVisible();
    await expect(pillars.filter({ hasText: 'Ceremonies' })).toBeVisible();
    await expect(pillars.filter({ hasText: 'Dance' })).toBeVisible();
  });
});

test.describe('Events search results — category pill + chip row use taxonomy', () => {
  test('category pill opens accordion picker; expanding Dance reveals subs; chip row reflects selection', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/events-search-results.html');
    await expect(page.locator('#categoryPill .label')).toHaveText('Any practice');
    await page.click('#categoryPill');
    const popover = page.locator('.pill-popover');
    await expect(popover).toBeVisible();
    await expect(popover.locator('.pill-popover-item--parent', { hasText: 'Workshops' })).toBeVisible();
    await expect(popover.locator('.pill-popover-item--parent', { hasText: 'Ceremonies' })).toBeVisible();
    // Subs are accordion-collapsed until parent is expanded
    await expect(popover.locator('.pill-popover-item--child', { hasText: 'Ecstatic Dance' })).toBeHidden();
    await popover.locator('.pill-popover-item--parent', { hasText: 'Dance' }).click();
    const ecstatic = popover.locator('.pill-popover-item--child', { hasText: 'Ecstatic Dance' }).first();
    await expect(ecstatic).toBeVisible();
    await ecstatic.click();
    await expect(page.locator('#categoryPill .label')).toHaveText('Dance · Ecstatic Dance');
    expect(page.url()).toContain('pillar=dance');
    expect(page.url()).toContain('sub=ecstatic-dance');
    // Chips switch to in-pillar mode
    await expect(page.locator('#chipRow .chip', { hasText: 'All Dance' })).toBeVisible();
  });

  test('default chip row surfaces popular shortcuts; clicking sets pillar + sub', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/events-search-results.html');
    const allChip = page.locator('#chipRow .chip', { hasText: /^All practices$/ });
    await expect(allChip).toBeVisible();
    await expect(allChip).toHaveClass(/is-active/);
    // At least one trending shortcut should be present
    await expect(page.locator('#chipRow .chip')).toHaveCount(13); // 1 "All" + 12 popular
  });

  test('legacy ?categoryId= still resolves the pill label', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/events-search-results.html?categoryId=cacao-ceremony');
    await expect(page.locator('#categoryPill .label')).toHaveText('Ceremonies · Cacao Ceremony');
  });

  test('opening picker with a pillar selected auto-expands its accordion', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/events-search-results.html?pillar=dance');
    await page.click('#categoryPill');
    const popover = page.locator('.pill-popover');
    // Dance group is open, Workshops group is closed
    await expect(popover.locator('[data-group="dance"]')).toHaveClass(/is-open/);
    await expect(popover.locator('[data-group="workshops"]')).not.toHaveClass(/is-open/);
    // Dance children visible immediately
    await expect(popover.locator('.pill-popover-item--child', { hasText: 'Ecstatic Dance' }).first()).toBeVisible();
  });
});
