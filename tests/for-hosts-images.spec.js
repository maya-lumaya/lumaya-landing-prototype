const { test, expect } = require('@playwright/test');

test('for-hosts demo event images load with non-zero naturalWidth', async ({ page }) => {
  await page.goto('file://' + process.cwd() + '/for-hosts.html');

  const imgs = page.locator('#events-demo .demo-event-img img');
  await expect(imgs).toHaveCount(4);

  for (let i = 0; i < 4; i++) {
    const img = imgs.nth(i);
    await img.scrollIntoViewIfNeeded();
    // wait for the image to actually load (network fetch)
    await expect(img).toBeVisible({ timeout: 15000 });
    await page.waitForFunction(
      el => el.complete && el.naturalWidth > 0,
      await img.elementHandle(),
      { timeout: 15000 }
    );
    const natural = await img.evaluate(el => el.naturalWidth);
    expect(natural, `Event image ${i} should have loaded (naturalWidth > 0)`).toBeGreaterThan(0);
  }
});
