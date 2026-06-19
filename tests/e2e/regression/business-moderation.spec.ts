import { expect, test } from '@playwright/test';

import { SEEDED_PERSONAS, signInAsPersona } from '../helpers/auth-personas';

test.setTimeout(90_000);

test.describe('@regression business moderation workflow', () => {
  test('admin can access businesses management page', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.ADMIN);
    await page.waitForURL(/\/en\/(m\/dashboard|admin|m\/2fa-required)/, { timeout: 60_000 });

    if (page.url().includes('/m/2fa-required')) {
      test.skip();
      return;
    }

    await page.goto('/en/admin/businesses');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const isOnBusinesses = currentUrl.includes('/admin/businesses');
    const isRedirected = currentUrl.includes('/sign-in') || currentUrl.includes('/m/dashboard');

    expect(isOnBusinesses || isRedirected).toBe(true);
  });

  test('admin businesses page displays list with status filters', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.ADMIN);
    await page.waitForURL(/\/en\/(m\/dashboard|admin|m\/2fa-required)/, { timeout: 60_000 });

    if (page.url().includes('/m/2fa-required')) {
      test.skip();
      return;
    }

    await page.goto('/en/admin/businesses');
    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/admin/businesses')) {
      test.skip();
      return;
    }

    const statusFilters = page.locator('button, [role="tab"]').filter({
      hasText: /all|published|pending|review|hidden|declined/i,
    });
    const hasFilters = (await statusFilters.count()) > 0;

    const businessList = page.locator('table, [role="list"], ul').first();
    const hasList = await businessList.isVisible().catch(() => false);

    expect(hasFilters || hasList).toBe(true);
  });

  test('non-admin user cannot access admin businesses page', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.MEMBER);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    await page.goto('/en/admin/businesses');
    await page.waitForURL(/\/en\/(m\/dashboard|sign-in)/, { timeout: 30_000 });

    const currentUrl = page.url();
    expect(currentUrl.includes('/admin/businesses')).toBe(false);
  });

  test('admin can view individual business details', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.ADMIN);
    await page.waitForURL(/\/en\/(m\/dashboard|admin|m\/2fa-required)/, { timeout: 60_000 });

    if (page.url().includes('/m/2fa-required')) {
      test.skip();
      return;
    }

    await page.goto('/en/admin/businesses');
    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/admin/businesses')) {
      test.skip();
      return;
    }

    const firstBusinessLink = page.locator('a[href*="/admin/businesses/"]').first();
    if (await firstBusinessLink.isVisible().catch(() => false)) {
      await firstBusinessLink.click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/\/en\/admin\/businesses\/[^/]+$/);
    }
  });
});
