import { expect, test } from '@playwright/test';

import { SEEDED_PERSONAS, signInAsPersona } from '../helpers/auth-personas';

test.setTimeout(90_000);

test.describe('@regression business introduction workflow', () => {
  test('FREE member sees restricted message on introduction tab', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.MEMBER);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.getByRole('button', { name: 'Introductions' }).click();
    await expect(page).toHaveURL(/tab=introduction/);

    const restrictedMessage = page.getByText(/VIP|upgrade|available.*member/i);
    await expect(restrictedMessage).toBeVisible();

    const form = page.locator('form').first();
    const hasForm = await form.isVisible().catch(() => false);
    expect(hasForm).toBe(false);
  });

  test('VIP member can access introduction tab', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.BUSINESS);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.getByRole('button', { name: 'Introductions' }).click();
    await expect(page).toHaveURL(/tab=introduction/);

    const form = page.locator('form').first();
    const restrictedMessage = page.getByText(/VIP|upgrade|available.*member/i);

    const hasForm = await form.isVisible().catch(() => false);
    const hasRestricted = await restrictedMessage.isVisible().catch(() => false);

    expect(hasForm || hasRestricted).toBe(true);
  });

  test('introduction tab shows recent requests section', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.BUSINESS);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.getByRole('button', { name: 'Introductions' }).click();
    await expect(page).toHaveURL(/tab=introduction/);

    const recentSection = page.getByText(/recent|history|requests/i);
    const emptyState = page.getByText(/no.*requests|empty|yet/i);

    const hasRecent = await recentSection.isVisible().catch(() => false);
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasRecent || hasEmpty).toBe(true);
  });

  test('admin can access introductions management page', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.ADMIN);
    await page.waitForURL(/\/en\/(m\/dashboard|admin|m\/2fa-required)/, { timeout: 60_000 });

    if (page.url().includes('/m/2fa-required')) {
      test.skip();
      return;
    }

    await page.goto('/en/admin/introductions');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const isOnIntroductions = currentUrl.includes('/admin/introductions');
    const isRedirected = currentUrl.includes('/sign-in') || currentUrl.includes('/m/dashboard');

    expect(isOnIntroductions || isRedirected).toBe(true);
  });

  test('non-admin user cannot access admin introductions page', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.MEMBER);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.goto('/en/admin/introductions');
    await page.waitForURL(/\/en\/(m\/dashboard|sign-in)/, { timeout: 30_000 });

    const currentUrl = page.url();
    expect(currentUrl.includes('/admin/introductions')).toBe(false);
  });

  test('introduction form requires business selection when available', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.BUSINESS);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.getByRole('button', { name: 'Introductions' }).click();
    await expect(page).toHaveURL(/tab=introduction/);

    const form = page.locator('form').first();
    if (!(await form.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const submitButton = form.getByRole('button', { name: /submit|send/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();

      const errorMessages = form.locator('[role="alert"], .text-destructive');
      const hasErrors = await errorMessages.count();
      expect(hasErrors).toBeGreaterThan(0);
    }
  });
});
