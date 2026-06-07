import { expect, test } from '@playwright/test';

test('@regression @security public routes send the release security headers', async ({ page }) => {
  const response = await page.goto('/en');

  expect(response?.headers()['content-security-policy']).toContain("default-src 'self'");
  expect(response?.headers()['content-security-policy']).toContain(
    'https://challenges.cloudflare.com',
  );
  expect(response?.headers()['content-security-policy']).toContain('https://js.stripe.com');
  expect(response?.headers()['content-security-policy']).toContain('https://plausible.io');
  expect(response?.headers()['x-frame-options']).toBe('DENY');
  expect(response?.headers()['x-content-type-options']).toBe('nosniff');
  expect(response?.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(response?.headers()['strict-transport-security']).toBe(
    'max-age=63072000; includeSubDomains; preload',
  );
  expect(response?.headers()['permissions-policy']).toContain('camera=()');
});
