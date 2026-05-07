import { test, expect } from '@playwright/test';

/* CategoryModel — pure model layer used by all category selectors
   (search bar desktop dropdown, mobile modal, and the 3 search-results
   filterbar pills). */

test.describe('CategoryModel — pure functions', () => {
  test('encodePath / decodePath round-trip', async ({ page }) => {
    await page.goto('/index.html');
    const result = await page.evaluate(() => {
      const M = window.CategoryModel;
      return {
        empty:       M.encodePath({ pillar: '', sub: '' }),
        pillarOnly:  M.encodePath({ pillar: 'workshops', sub: '' }),
        full:        M.encodePath({ pillar: 'dance', sub: 'ecstatic-dance' }),
        decodedFull: M.decodePath('dance/ecstatic-dance'),
        decodedP:    M.decodePath('workshops'),
        decodedNull: M.decodePath(''),
      };
    });
    expect(result.empty).toBe('');
    expect(result.pillarOnly).toBe('workshops');
    expect(result.full).toBe('dance/ecstatic-dance');
    expect(result.decodedFull).toEqual({ pillar: 'dance', sub: 'ecstatic-dance' });
    expect(result.decodedP).toEqual({ pillar: 'workshops', sub: '' });
    expect(result.decodedNull).toEqual({ pillar: '', sub: '' });
  });

  test('formatLabel reads taxonomy and joins pillar · sub', async ({ page }) => {
    await page.goto('/index.html');
    const result = await page.evaluate(() => {
      const M = window.CategoryModel;
      const T = window.Taxonomy.EVENT_TAXONOMY;
      return {
        none:   M.formatLabel(T, { pillar: '', sub: '' }, 'Any practice'),
        pOnly:  M.formatLabel(T, { pillar: 'workshops', sub: '' }, 'Any practice'),
        full:   M.formatLabel(T, { pillar: 'dance', sub: 'ecstatic-dance' }, 'Any practice'),
        unknown: M.formatLabel(T, { pillar: 'nope', sub: '' }, 'Any practice'),
      };
    });
    expect(result.none).toBe('Any practice');
    expect(result.pOnly).toBe('Workshops');
    expect(result.full).toBe('Dance · Ecstatic Dance');
    expect(result.unknown).toBe('Any practice');
  });

  test('buildPickerTree emits PillPicker tree shape', async ({ page }) => {
    await page.goto('/index.html');
    const tree = await page.evaluate(() => {
      const M = window.CategoryModel;
      const T = window.Taxonomy.RETREAT_TAXONOMY;
      const t = M.buildPickerTree(T, 'Any practice');
      return {
        firstValue: t[0].value,
        firstLabel: t[0].label,
        sampleParent: { value: t[1].value, label: t[1].label, hasChildren: !!t[1].children?.length },
        sampleChild: t[1].children[0],
      };
    });
    expect(tree.firstValue).toBe('');
    expect(tree.firstLabel).toBe('Any practice');
    expect(tree.sampleParent.value).toBe('yoga');
    expect(tree.sampleParent.label).toBe('Yoga');
    expect(tree.sampleParent.hasChildren).toBe(true);
    expect(tree.sampleChild.value).toContain('yoga/');
    expect(tree.sampleChild.label).toBeTruthy();
  });
});

test.describe('Retreats search results — practicePill uses CategoryModel', () => {
  test('practice pill opens accordion picker; expanding pillar reveals subs; selection sets pillar + sub slug in URL', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/retreats-search-results.html');
    await expect(page.locator('#practicePill .label')).toHaveText('Any practice');
    await page.click('#practicePill');
    const popover = page.locator('.pill-popover');
    await expect(popover).toBeVisible();
    // Subs are hidden until the pillar is expanded.
    const yogaParent = popover.locator('.pill-popover-item--parent', { hasText: 'Yoga' });
    await expect(yogaParent).toBeVisible();
    await expect(popover.locator('.pill-popover-item--child', { hasText: 'Vinyasa Yoga' })).toBeHidden();
    await yogaParent.click();
    const vinyasa = popover.locator('.pill-popover-item--child', { hasText: 'Vinyasa Yoga' }).first();
    await expect(vinyasa).toBeVisible();
    await vinyasa.click();
    await expect(page.locator('#practicePill .label')).toHaveText('Yoga · Vinyasa Yoga');
    expect(page.url()).toContain('practice=yoga');
    expect(page.url()).toContain('sub=vinyasa-yoga');
  });

  test('"All [Pillar]" row selects the pillar without picking a sub', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/retreats-search-results.html');
    await page.click('#practicePill');
    const popover = page.locator('.pill-popover');
    await popover.locator('.pill-popover-item--parent', { hasText: 'Meditation' }).click();
    await popover.locator('.pill-popover-item--all-of', { hasText: 'All Meditation' }).click();
    await expect(page.locator('#practicePill .label')).toHaveText('Meditation');
    expect(page.url()).toContain('practice=meditation');
    expect(page.url()).not.toContain('sub=');
  });
});

test.describe('Trainings search results — disciplinePill uses CategoryModel', () => {
  test('discipline pill opens accordion picker; expanding pillar reveals subs; selection sets discipline + sub slug in URL', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/trainings-search-results.html');
    await expect(page.locator('#disciplinePill .label')).toHaveText('Any discipline');
    await page.click('#disciplinePill');
    const popover = page.locator('.pill-popover');
    await expect(popover).toBeVisible();
    const yogaParent = popover.locator('.pill-popover-item--parent', { hasText: 'Yoga' });
    await expect(yogaParent).toBeVisible();
    await expect(popover.locator('.pill-popover-item--child', { hasText: '200 Hour YTT' })).toBeHidden();
    await yogaParent.click();
    const yttBtn = popover.locator('.pill-popover-item--child', { hasText: '200 Hour YTT' }).first();
    await expect(yttBtn).toBeVisible();
    await yttBtn.click();
    await expect(page.locator('#disciplinePill .label')).toHaveText('Yoga · 200 Hour YTT');
    expect(page.url()).toContain('discipline=yoga');
    expect(page.url()).toContain('sub=200-hour-ytt');
  });
});
