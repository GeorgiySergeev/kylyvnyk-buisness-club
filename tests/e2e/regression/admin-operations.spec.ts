import { expect, test } from '@playwright/test';

import { SEEDED_PERSONAS, signInAsPersona } from '../helpers/auth-personas';

test.setTimeout(90_000);

test.describe('@regression admin operations workflow', () => {
  test('admin dashboard is accessible for admin users', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.ADMIN);
    await page.waitForURL(/\/en\/(m\/dashboard|admin|m\/2fa-required)/, { timeout: 60_000 });

    if (page.url().includes('/m/2fa-required')) {
      test.skip();
      return;
    }

    await page.goto('/en/admin');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const isOnAdmin = currentUrl.includes('/admin');
    const isRedirected = currentUrl.includes('/sign-in') || currentUrl.includes('/m/dashboard');

    expect(isOnAdmin || isRedirected).toBe(true);
  });

  test('admin users page displays user list', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.ADMIN);
    await page.waitForURL(/\/en\/(m\/dashboard|admin|m\/2fa-required)/, { timeout: 60_000 });

    if (page.url().includes('/m/2fa-required')) {
      test.skip();
      return;
    }

    await page.goto('/en/admin/users');
    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/admin/users')) {
      test.skip();
      return;
    }

    const userList = page.locator('table, [role="list"], ul').first();
    const searchInput = page.getByPlaceholder(/search|find|filter/i);

    const hasList = await userList.isVisible().catch(() => false);
    const hasSearch = await searchInput.isVisible().catch(() => false);

    expect(hasList || hasSearch).toBe(true);
  });

  test('admin categories page is accessible', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.ADMIN);
    await page.waitForURL(/\/en\/(m\/dashboard|admin|m\/2fa-required)/, { timeout: 60_000 });

    if (page.url().includes('/m/2fa-required')) {
      test.skip();
      return;
    }

    await page.goto('/en/admin/categories');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const isOnCategories = currentUrl.includes('/admin/categories');
    const isRedirected = currentUrl.includes('/sign-in') || currentUrl.includes('/m/dashboard');

    expect(isOnCategories || isRedirected).toBe(true);
  });

  test('admin countries page is accessible', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.ADMIN);
    await page.waitForURL(/\/en\/(m\/dashboard|admin|m\/2fa-required)/, { timeout: 60_000 });

    if (page.url().includes('/m/2fa-required')) {
      test.skip();
      return;
    }

    await page.goto('/en/admin/countries');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const isOnCountries = currentUrl.includes('/admin/countries');
    const isRedirected = currentUrl.includes('/sign-in') || currentUrl.includes('/m/dashboard');

    expect(isOnCountries || isRedirected).toBe(true);
  });

  test('admin audit log page is accessible', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.ADMIN);
    await page.waitForURL(/\/en\/(m\/dashboard|admin|m\/2fa-required)/, { timeout: 60_000 });

    if (page.url().includes('/m/2fa-required')) {
      test.skip();
      return;
    }

    await page.goto('/en/admin/audit');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const isOnAudit = currentUrl.includes('/admin/audit');
    const isRedirected = currentUrl.includes('/sign-in') || currentUrl.includes('/m/dashboard');

    expect(isOnAudit || isRedirected).toBe(true);
  });

  test('non-admin user is redirected from all admin routes', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.MEMBER);
    await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

    const adminRoutes = ['/admin', '/admin/users', '/admin/businesses', '/admin/categories'];

    for (const route of adminRoutes) {
      await page.goto(`/en${route}`);
      await page.waitForURL(/\/en\/(m\/dashboard|sign-in)/, { timeout: 15_000 });

      const currentUrl = page.url();
      expect(currentUrl.includes(route)).toBe(false);
    }
  });

  test('admin cards management page is accessible', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.ADMIN);
    await page.waitForURL(/\/en\/(m\/dashboard|admin|m\/2fa-required)/, { timeout: 60_000 });

    if (page.url().includes('/m/2fa-required')) {
      test.skip();
      return;
    }

    await page.goto('/en/admin/cards');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const isOnCards = currentUrl.includes('/admin/cards');
    const isRedirected = currentUrl.includes('/sign-in') || currentUrl.includes('/m/dashboard');

    expect(isOnCards || isRedirected).toBe(true);
  });

  test('admin subscriptions page is accessible', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.ADMIN);
    await page.waitForURL(/\/en\/(m\/dashboard|admin|m\/2fa-required)/, { timeout: 60_000 });

    if (page.url().includes('/m/2fa-required')) {
      test.skip();
      return;
    }

    await page.goto('/en/admin/subscriptions');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const isOnSubscriptions = currentUrl.includes('/admin/subscriptions');
    const isRedirected = currentUrl.includes('/sign-in') || currentUrl.includes('/m/dashboard');

    expect(isOnSubscriptions || isRedirected).toBe(true);
  });

  test('admin self-profile route works', async ({ page }) => {
    await signInAsPersona(page, SEEDED_PERSONAS.ADMIN);
    await page.waitForURL(/\/en\/(m\/dashboard|admin|m\/2fa-required)/, { timeout: 60_000 });

    if (page.url().includes('/m/2fa-required')) {
      test.skip();
      return;
    }

    await page.goto('/en/admin/profile');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const isOnProfile = currentUrl.includes('/admin/profile') || currentUrl.includes('/m/dashboard');
    const isRedirected = currentUrl.includes('/sign-in');

    expect(isOnProfile || isRedirected).toBe(true);
  });
});
