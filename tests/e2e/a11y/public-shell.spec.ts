import { expect, test } from '@playwright/test';

test('@a11y public home exposes a working skip-link target', async ({ page }) => {
  await page.goto('/en');

  const skipLink = page.getByRole('link', { name: /skip/i });
  await expect(skipLink).toHaveAttribute('href', '#main-content');
  await expect(page.locator('#main-content')).toHaveCount(1);
  await expect(page.locator('#main-content')).toBeVisible();
});
