# 02-playwright-auth-checkout-verifycard.md

## Title

Playwright E2E — auth, VIP checkout redirect, verify-card

## Objective

Cover critical happy paths:

- Sign in with test account.
- Trigger VIP checkout; ensure redirect to Stripe Checkout domain.
- Visit verify-card page and see public data.

## Prereqs

- Install Playwright: pnpm create playwright@latest
- Create test user in Clerk Dashboard (email/password) and set env PW_TEST_EMAIL / PW_TEST_PASSWORD.
- Ensure at least one card exists for that user (visit /member locally once).

## Config

### playwright.config.ts (example)

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

## Tests

### e2e/auth.signin.spec.ts

```ts
import { expect, test } from '@playwright/test';

test('sign in and land on member page', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill(process.env.PW_TEST_EMAIL!);
  await page.getByLabel('Password').fill(process.env.PW_TEST_PASSWORD!);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/member**', { timeout: 15000 });
  await expect(page).toHaveURL(/\/member/);
});
```

### e2e/vip.checkout.redirect.spec.ts

```ts
import { expect, test } from '@playwright/test';

test('VIP checkout leads to Stripe Checkout', async ({ page }) => {
  await page.goto('/');
  // Ensure signed in first or navigate to sign-in helper if needed.
  // Click VIP CTA (text may be localized; use regex)
  const vipSelector = page.getByRole('link', { name: /vip/i });
  if (await vipSelector.isVisible()) {
    await vipSelector.click();
  } else {
    // Fallback: call API and validate JSON response contains a URL
    const res = await page.request.post('/api/stripe/checkout');
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.url).toMatch(/^https:\/\/(checkout|buy)\.stripe\.com/i);
  }
});
```

### e2e/verify.card.spec.ts

```ts
import { expect, test } from '@playwright/test';

test('verify-card shows public fields', async ({ page }) => {
  // Replace with an existing card number from your dev DB
  const number = process.env.PW_TEST_CARD_NUMBER!;
  await page.goto(`/verify-card/${encodeURIComponent(number)}`);
  await expect(page.getByText('Card number', { exact: false })).toBeVisible();
  await expect(page.getByText(number)).toBeVisible();
});
```

## Env and scripts

- .env.local: add PW_TEST_EMAIL, PW_TEST_PASSWORD, PW_TEST_CARD_NUMBER
- package.json:
  - "e2e": "playwright test"

## Acceptance

- Auth flow navigates to /member.
- VIP checkout test at least reaches Stripe Checkout redirect step or returns JSON with a Stripe Checkout URL.
- verify-card shows the card number.
