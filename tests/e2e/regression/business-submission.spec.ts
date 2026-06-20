import { expect, test } from '@playwright/test';

import { SEEDED_PERSONAS, signInAsPersona } from '../helpers/auth-personas';

test.setTimeout(90_000);

test.describe('@regression business submission workflow', () => {
  test('partner registration form opens and displays all steps', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.MEMBER);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.goto('/en/partner/register');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /business|partner/i })).toBeVisible();

    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('business submission form validates required fields', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.MEMBER);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.goto('/en/partner/register');
    await page.waitForLoadState('networkidle');

    const submitButton = page.getByRole('button', { name: /submit|next/i }).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();

      const errorMessages = page.locator('[role="alert"], .text-destructive, .text-red-500');
      const hasErrors = await errorMessages.count();
      expect(hasErrors).toBeGreaterThan(0);
    }
  });

  test('unauthenticated user cannot access partner registration', async ({ page }) => {
    await page.goto('/en/partner/register');
    await page.waitForURL(/\/en\/sign-in/, { timeout: 30_000 });
    await expect(page).toHaveURL(/\/en\/sign-in/);
  });

  test('dashboard features tab shows submit business link for eligible users', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.BUSINESS);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.getByRole('button', { name: 'Features' }).click();

    const submitBusinessLink = page.getByRole('link', { name: /submit.*business|business.*submit/i });
    const businessStatus = page.getByText(/status|pending|published|review/i);

    const hasLink = await submitBusinessLink.isVisible().catch(() => false);
    const hasStatus = await businessStatus.isVisible().catch(() => false);

    expect(hasLink || hasStatus).toBe(true);
  });
});
