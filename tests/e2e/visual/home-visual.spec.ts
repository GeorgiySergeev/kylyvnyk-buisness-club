import { expect, test } from '@playwright/test';

test('@visual public home renders a non-empty desktop screenshot', async ({ page }) => {
  await page.goto('/en');

  const screenshot = await page.screenshot({ fullPage: true });

  expect(screenshot.byteLength).toBeGreaterThan(10_000);
});
