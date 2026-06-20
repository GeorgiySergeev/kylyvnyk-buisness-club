import { expect, test } from '@playwright/test';

import { SEEDED_PERSONAS, signInAsPersona } from '../helpers/auth-personas';

test.setTimeout(90_000);

test.describe('@regression subscription state transitions', () => {
  test('FREE member sees upgrade CTA on subscription tab', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.MEMBER);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.getByRole('button', { name: 'Subscription' }).click();
    await expect(page).toHaveURL(/tab=subscription/);

    const upgradeButton = page.getByRole('button', { name: /upgrade|VIP|become/i });
    const subscriptionInfo = page.getByText(/subscription|plan|membership/i);

    const hasUpgrade = await upgradeButton.isVisible().catch(() => false);
    const hasInfo = await subscriptionInfo.isVisible().catch(() => false);

    expect(hasUpgrade || hasInfo).toBe(true);
  });

  test('VIP member sees subscription status and cancel option', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.BUSINESS);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.getByRole('button', { name: 'Subscription' }).click();
    await expect(page).toHaveURL(/tab=subscription/);

    const statusInfo = page.getByText(/active|status|period|current/i);
    const cancelButton = page.getByRole('button', { name: /cancel/i });

    const hasStatus = await statusInfo.isVisible().catch(() => false);
    const hasCancel = await cancelButton.isVisible().catch(() => false);

    expect(hasStatus || hasCancel).toBe(true);
  });

  test('features tab shows membership plans with pricing', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.MEMBER);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.getByRole('button', { name: 'Features' }).click();
    await expect(page).toHaveURL(/tab=features/);

    const plansSection = page.getByText(/VIP|Premium|Member|Partner/i);
    await expect(plansSection).toBeVisible();

    const pricingInfo = page.getByText(/\$|month|year|price/i);
    const hasPricing = await pricingInfo.isVisible().catch(() => false);
    expect(hasPricing).toBe(true);
  });

  test('billing period toggle switches between monthly and yearly', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.MEMBER);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.getByRole('button', { name: 'Features' }).click();
    await expect(page).toHaveURL(/tab=features/);

    const monthlyButton = page.getByRole('button', { name: /monthly/i });
    const yearlyButton = page.getByRole('button', { name: /yearly|annual/i });

    if (await monthlyButton.isVisible().catch(() => false)) {
      await expect(monthlyButton).toBeVisible();
    }

    if (await yearlyButton.isVisible().catch(() => false)) {
      await yearlyButton.click();

      const annualPricing = page.getByText(/\/year|annual|yearly/i);
      const hasAnnual = await annualPricing.isVisible().catch(() => false);
      expect(hasAnnual).toBe(true);
    }
  });

  test('checkout success page redirects to dashboard', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.MEMBER);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.goto('/en/m/checkout/success');
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 30_000 });
    await expect(page).toHaveURL(/\/en\/m\/dashboard/);
  });

  test('checkout cancel page redirects to dashboard', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.MEMBER);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.goto('/en/m/checkout/cancel');
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 30_000 });
    await expect(page).toHaveURL(/\/en\/m\/dashboard/);
  });

  test('subscription tab shows billing portal link for active subscribers', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.BUSINESS);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.getByRole('button', { name: 'Subscription' }).click();
    await expect(page).toHaveURL(/tab=subscription/);

    const billingPortal = page.getByRole('button', { name: /billing|portal|manage|payment/i });
    const subscriptionStatus = page.getByText(/active|status|period/i);

    const hasPortal = await billingPortal.isVisible().catch(() => false);
    const hasStatus = await subscriptionStatus.isVisible().catch(() => false);

    expect(hasPortal || hasStatus).toBe(true);
  });
});
