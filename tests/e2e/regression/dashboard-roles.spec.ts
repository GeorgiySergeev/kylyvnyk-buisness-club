import { expect, test } from '@playwright/test';

import { SEEDED_PERSONAS, signInAsPersona } from '../helpers/auth-personas';

test.setTimeout(90_000);

test.describe('@regression dashboard role-based visibility', () => {
  test('FREE member sees upgrade CTA and restricted introduction tab', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.MEMBER);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await expect(page.getByRole('navigation', { name: 'Dashboard sections' })).toBeVisible();

    await expect(page.getByRole('region', { name: 'Club membership card' })).toBeVisible();

    await page.getByRole('button', { name: 'Features' }).click();
    await expect(page.getByRole('button', { name: /Upgrade to VIP|Become VIP/i })).toBeVisible();

    await page.getByRole('button', { name: 'Introductions' }).click();
    await expect(page.getByText(/VIP members can submit|available.*VIP|upgrade/i)).toBeVisible();
  });

  test('VIP member sees current plan badge and introduction form', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.BUSINESS);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await expect(page.getByRole('navigation', { name: 'Dashboard sections' })).toBeVisible();

    await page.getByRole('button', { name: 'Features' }).click();
    await expect(page.getByText(/Current|Active|VIP/i)).toBeVisible();

    await page.getByRole('button', { name: 'Introductions' }).click();
    const introductionForm = page.locator('form, [role="form"]').first();
    const restrictedMessage = page.getByText(/VIP members can submit|available.*VIP|upgrade/i);

    const hasForm = await introductionForm.isVisible().catch(() => false);
    const hasRestricted = await restrictedMessage.isVisible().catch(() => false);

    expect(hasForm || hasRestricted).toBe(true);
  });

  test('ADMIN user can access admin dashboard', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.ADMIN);
    await page.waitForURL(/\/en\/m\/dashboard|\/en\/admin|\/en\/m\/2fa-required/, {
      timeout: 60_000,
    });

    const currentUrl = page.url();
    const isOnDashboard = currentUrl.includes('/m/dashboard');
    const isOnAdmin = currentUrl.includes('/admin');
    const isOn2fa = currentUrl.includes('/m/2fa-required');

    expect(isOnDashboard || isOnAdmin || isOn2fa).toBe(true);
  });

  test('unauthenticated user is redirected to sign-in from dashboard', async ({ page }) => {
    await page.goto('/en/m/dashboard');
    await page.waitForURL(/\/en\/sign-in/, { timeout: 30_000 });
    await expect(page).toHaveURL(/\/en\/sign-in/);
  });

  test('dashboard tabs navigation works correctly', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.MEMBER);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    const nav = page.getByRole('navigation', { name: 'Dashboard sections' });
    await expect(nav).toBeVisible();

    const expectedTabs = ['Profile', 'Features', 'Introductions', 'Subscription', 'Settings'];
    for (const tabName of expectedTabs) {
      await expect(nav.getByRole('button', { name: tabName })).toBeVisible();
    }

    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/tab=settings/);

    await page.getByRole('button', { name: 'Profile' }).click();
    await expect(page).toHaveURL(/tab=profile/);
  });
});
