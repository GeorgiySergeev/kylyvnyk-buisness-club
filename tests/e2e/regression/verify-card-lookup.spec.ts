import { expect, test } from '@playwright/test';

test('@regression verify-card lookup redirects to the public card result page', async ({
  page,
}) => {
  await page.goto('/en/verify-card');

  await expect(page.getByRole('heading', { name: 'Verify Club Card' })).toBeVisible();
  await page.getByLabel('Card number').fill('VIP-UA-SEED00002');
  await page.getByRole('button', { name: 'Verify card' }).click();

  await expect(page).toHaveURL(/\/en\/verify-card\/VIP-UA-SEED00002$/);
  await expect(page.getByText('VIP-UA-SEED00002')).toBeVisible();
  await expect(
    page.getByText('Contact, payment, and account data are never shown here.'),
  ).toBeVisible();
});
