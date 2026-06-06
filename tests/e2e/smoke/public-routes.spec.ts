import { expect, test } from '@playwright/test';

test('@smoke home page opens', async ({ page }) => {
  await page.goto('/en');

  await expect(page).toHaveURL(/\/en$/);
});

test('@smoke directory page opens', async ({ page }) => {
  await page.goto('/en/directory');

  await expect(page).toHaveURL(/\/en\/directory$/);
});

test('@smoke protected admin route redirects to sign-in without auth', async ({ page }) => {
  await page.goto('/en/admin');

  await expect(page).toHaveURL(/\/en\/sign-in/);
});
