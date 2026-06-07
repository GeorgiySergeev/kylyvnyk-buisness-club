import { expect, test } from '@playwright/test';

test.setTimeout(90_000);

function buildUniquePhone(workerIndex: number) {
  return `+1555${workerIndex}${Date.now().toString().slice(-8)}`;
}

test('@regression member can sign up, skip onboarding, and open the dashboard', async ({
  page,
}, testInfo) => {
  const phone = buildUniquePhone(testInfo.workerIndex);

  await page.goto('/en/sign-up');
  await page.getByLabel('Phone number').fill(phone);
  await page.getByRole('button', { name: 'Use dev bypass' }).click();

  await expect(page).toHaveURL(/\/en\/m\/onboarding$/, { timeout: 60_000 });
  await expect(page.getByRole('heading', { name: 'Set up your profile' })).toBeVisible();

  await page.getByRole('button', { name: 'Fill in later' }).click();

  await expect(page).toHaveURL(/\/en\/m\/dashboard/, { timeout: 60_000 });
  const welcomeDialog = page.getByRole('dialog', {
    name: 'Congratulations! Welcome to KYLYVNYK Business Club!',
  });
  await expect(welcomeDialog).toBeVisible();
  await expect(welcomeDialog.getByText('Your club card is ready.')).toBeVisible();
  await welcomeDialog.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByRole('navigation', { name: 'Dashboard sections' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Club membership card' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Quick actions' })).toBeVisible();
});
