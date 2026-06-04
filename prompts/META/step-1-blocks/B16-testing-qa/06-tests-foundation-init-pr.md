# 06-tests-foundation-init-pr.md

> **Status:** Revision required before execution.
> **Strategy source:** `docs/TESTING.md`.
> Implement only Phase 1 of that strategy first. Do not replace the existing
> `tsx --test` suite, enforce repository-wide 80% coverage, permanently bypass
> unhandled MSW requests, or treat a dev-bypass cookie as role-aware E2E auth.
> This prompt remains as historical implementation detail until it is rewritten
> into the phased migration defined by `docs/TESTING.md`.

## Title

Testing foundation — Vitest + MSW + Playwright (single init PR)

> **Type:** implementation prompt (single PR)  
> **Branch:** `chore/tests-foundation`  
> **Supersedes (partial):** `01-vitest-rtl-setup.md` (bootstrap); complements `02-playwright-auth-checkout-verifycard.md`, `04-ci-lint-type-checks.md`  
> **Supersedes:** ad-hoc `tsx --test` runner in `package.json` for covered paths only  
> **Mirror:** `tests/test-plan-init-pr.md` (pointer only)  
> **References:** `AGENTS.md` §3 (Vitest + Playwright)

---

## Objective

Bootstrap the test stack for KCLUB-MVP: Vitest (node + jsdom projects), MSW for outbound HTTP, Playwright E2E smoke for protected `/en/admin`, and CI gates for coverage + E2E. Deliver a green `pnpm verify` on the PR branch.

---

## Scope

| In scope | Out of scope |
| -------- | ------------ |
| DevDependencies + configs (`vitest`, MSW, Playwright) | Codecov upload |
| Migrate / add auth unit + middleware integration tests | Full Supabase Auth mocking |
| E2E: redirect without cookie; no redirect with dev-bypass cookie | Asserting HTTP 200 on `/en/admin` page body |
| Extend `.github/workflows/ci.yml` with coverage + E2E job | Component RTL tests (follow-up PR) |
| Replace `pnpm test` script to use Vitest | Deleting unrelated `tests/**` still on `tsx --test` until migrated |

---

## Preconditions

- Node 20.x (`.nvmrc`), pnpm 9.x.
- Source modules exist: `@/features/auth/lib/phone`, `@/features/auth/lib/dev-auth`, `@/middleware`.
- Human runs `pnpm add` with **exact versions** pinned in the PR (do not leave floating ranges without lockfile update).

---

## Execution order

### Step 1 — Branch and dependencies

```bash
git checkout -b chore/tests-foundation
pnpm add -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom msw @playwright/test
npx playwright install --with-deps
```

Optional on Windows if `webServer` env prefix fails: `pnpm add -D cross-env`.

---

### Step 2 — `package.json` scripts

Replace the `scripts` block values below; keep all other `package.json` fields unchanged.

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run --config vitest.config.ts --project node --project jsdom",
    "test:watch": "vitest --watch --config vitest.config.ts --project node --project jsdom",
    "test:coverage": "vitest run --coverage --config vitest.config.ts --project node --project jsdom",
    "test:e2e": "playwright test",
    "vocab:check": "node scripts/vocab-check.mjs",
    "env:check": "node scripts/env-check.mjs",
    "smoke:routes": "node scripts/smoke-routes.mjs",
    "verify": "pnpm lint && pnpm vocab:check && pnpm env:check && pnpm build && pnpm typecheck && pnpm test:coverage && pnpm test:e2e",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "echo 'Use db:migrate instead. db:push disabled.' && exit 1",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx src/db/seed.ts"
  }
}
```

**Migration note:** `tests/auth/phone.test.ts` today uses `node:test` + `tsx`. Either rewrite it to Vitest (preferred) or exclude it from Vitest and remove it from the old `tsx --test` glob once equivalent cases exist under Vitest.

---

### Step 3 — Root configs

#### `vitest.config.ts` (create)

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

export default defineConfig({
  resolve: {
    alias: {
      '@/': fileURLToPath(new URL('./src/', import.meta.url)),
    },
  },
  test: {
    globals: true,
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/styles/**',
        'src/assets/**',
        '**/*.d.ts',
        '**/__mocks__/**',
        '**/*.stories.*',
        'src/**/index.{ts,tsx}',
      ],
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
    },
  },
  projects: [
    {
      test: {
        name: 'node',
        environment: 'node',
        setupFiles: ['tests/setup/setup-vitest.node.ts'],
      },
    },
    {
      test: {
        name: 'jsdom',
        environment: 'jsdom',
        setupFiles: ['tests/setup/setup-vitest.dom.ts'],
      },
    },
  ],
});
```

#### `playwright.config.ts` (create)

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command:
      process.platform === 'win32'
        ? 'cross-env AUTH_DEV_PHONE_BYPASS_ENABLED=1 NODE_ENV=development pnpm dev'
        : 'AUTH_DEV_PHONE_BYPASS_ENABLED=1 NODE_ENV=development pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
```

---

### Step 4 — Vitest + MSW setup

| File | Purpose |
| ---- | ------- |
| `tests/setup/setup-vitest.node.ts` | MSW lifecycle + safe default env (node project) |
| `tests/setup/setup-vitest.dom.ts` | `@testing-library/jest-dom` + MSW (jsdom project) |
| `tests/setup/msw/handlers.ts` | Stub Sentry, Plausible, Upstash, Stripe, Supabase |
| `tests/setup/msw/server.ts` | `setupServer(...handlers)` |

#### `tests/setup/setup-vitest.node.ts`

```ts
import { server } from './msw/server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

process.env.SENTRY_DSN = '';
process.env.NEXT_PUBLIC_SUPABASE_URL = '';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = '';
process.env.AUTH_DEV_PHONE_BYPASS_ENABLED =
  process.env.AUTH_DEV_PHONE_BYPASS_ENABLED ?? '0';
```

#### `tests/setup/setup-vitest.dom.ts`

```ts
import '@testing-library/jest-dom';
import { server } from './msw/server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});
```

#### `tests/setup/msw/handlers.ts`

```ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post(/sentry\.io\/api\/\d+\/envelope/, () =>
    HttpResponse.json({}, { status: 200 }),
  ),
  http.post(/plausible\.io\/api\/event/, () =>
    HttpResponse.json({}, { status: 202 }),
  ),
  http.all(/upstash\.io/, () => HttpResponse.json({ ok: true }, { status: 200 })),
  http.all(/stripe\.com|api\.stripe\.com/, () =>
    HttpResponse.json({}, { status: 200 }),
  ),
  http.all(/supabase\.co/, () => HttpResponse.json({}, { status: 200 })),
];
```

#### `tests/setup/msw/server.ts`

```ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

---

### Step 5 — Unit tests (`node` project)

#### `tests/auth/phone.test.ts`

Cover `normalizePhoneNumber`, `phoneNumberSchema`, and preserve behavior from the existing `node:test` file for `phoneOtpRequestSchema` / `phoneOtpVerifySchema`.

```ts
import { describe, it, expect } from 'vitest';
import {
  normalizePhoneNumber,
  phoneNumberSchema,
  phoneOtpRequestSchema,
  phoneOtpVerifySchema,
} from '@/features/auth/lib/phone';

describe('phone utils', () => {
  it('normalizePhoneNumber adds + and strips non-digits', () => {
    expect(normalizePhoneNumber(' 1 (555) 000-0003 ')).toBe('+15550000003');
    expect(normalizePhoneNumber('+38 099-123-45-67')).toBe('+380991234567');
  });

  it('phoneNumberSchema accepts valid numbers', () => {
    const res = phoneNumberSchema.safeParse(' +1 (555) 000-0001 ');
    expect(res.success).toBe(true);
    if (res.success) expect(res.data).toBe('+15550000001');
  });

  it('phoneNumberSchema rejects invalid', () => {
    for (const bad of ['12345', '+0123456', '+1 23', '+']) {
      expect(phoneNumberSchema.safeParse(bad).success).toBe(false);
    }
  });

  it('phoneOtpRequestSchema strips unknown keys', () => {
    const res = phoneOtpRequestSchema.safeParse({
      phone: '+380 50 123 45 67',
      displayName: 'Legacy Name',
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.phone).toBe('+380501234567');
      expect('displayName' in res.data).toBe(false);
    }
  });

  it('phoneOtpVerifySchema validates 6-digit code', () => {
    expect(
      phoneOtpVerifySchema.safeParse({ code: '123456', phone: '+15550000001' })
        .success,
    ).toBe(true);
    expect(
      phoneOtpVerifySchema.safeParse({ code: '12345a', phone: '+15550000001' })
        .success,
    ).toBe(false);
  });
});
```

#### `tests/auth/dev-auth.test.ts` (create)

```ts
import { describe, it, expect } from 'vitest';
import {
  encodeDevPhoneAuthCookie,
  decodeDevPhoneAuthCookie,
} from '@/features/auth/lib/dev-auth';

describe('dev-auth cookie', () => {
  it('roundtrips phone through base64url', () => {
    const phone = '+15550000001';
    const enc = encodeDevPhoneAuthCookie(phone);
    expect(typeof enc).toBe('string');
    expect(decodeDevPhoneAuthCookie(enc)).toBe(phone);
  });

  it('returns null on invalid', () => {
    expect(decodeDevPhoneAuthCookie(undefined)).toBeNull();
    expect(decodeDevPhoneAuthCookie('%%%')).toBeNull();
  });
});
```

---

### Step 6 — Middleware integration (`node` project)

Early branches only — do **not** reach `supabase.auth.getUser()`; no `@supabase/ssr` mock required.

#### `tests/auth/middleware.test.ts` (create)

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import middleware from '@/middleware';
import {
  encodeDevPhoneAuthCookie,
  DEV_PHONE_AUTH_COOKIE,
} from '@/features/auth/lib/dev-auth';

function makeRequest(path: string, cookie?: string) {
  const headers = new Headers();
  if (cookie) headers.set('cookie', cookie);
  return new NextRequest(`http://localhost${path}`, { headers });
}

describe('middleware', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    process.env.AUTH_DEV_PHONE_BYPASS_ENABLED = '0';
    process.env.NODE_ENV = 'test';
  });

  it('sets x-locale and does not block public route', async () => {
    const res = await middleware(makeRequest('/en'));
    expect(res.headers.get('x-locale')).toBe('en');
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects protected route to sign-in without auth', async () => {
    const res = await middleware(makeRequest('/en/admin'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toMatch(/^\/en\/sign-in\?/);
    expect(res.headers.get('x-locale')).toBe('en');
  });

  it('allows protected route with dev-bypass cookie when enabled', async () => {
    process.env.AUTH_DEV_PHONE_BYPASS_ENABLED = '1';
    const cookie = `${DEV_PHONE_AUTH_COOKIE}=${encodeDevPhoneAuthCookie('+15550000001')}`;
    const res = await middleware(makeRequest('/uk/admin', cookie));
    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-locale')).toBe('uk');
  });
});
```

---

### Step 7 — Playwright E2E

#### `tests/e2e/admin.spec.ts` (create)

```ts
import { test, expect } from '@playwright/test';
import {
  encodeDevPhoneAuthCookie,
  DEV_PHONE_AUTH_COOKIE,
} from '@/features/auth/lib/dev-auth';

test('protected /en/admin redirects to sign-in without cookie', async ({ page }) => {
  await page.goto('/en/admin');
  expect(page.url()).toMatch(/\/en\/sign-in/);
});

test('protected /en/admin opens with dev-bypass cookie', async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: DEV_PHONE_AUTH_COOKIE,
      value: encodeDevPhoneAuthCookie('+15550000001'),
      url: 'http://localhost:3000',
      httpOnly: false,
    },
  ]);
  await page.goto('/en/admin');
  expect(page.url()).toMatch(/\/en\/admin/);
  expect(page.url()).not.toMatch(/\/sign-in/);
});
```

**Assertion contract:** success means middleware did not redirect to `/sign-in`. Do not assert page HTML or status 200 (admin page may 404 during MVP).

---

### Step 8 — CI (`.github/workflows/ci.yml`)

Extend the existing workflow — do not remove `release-gates` env contract. Add after the current `pnpm test` step (or replace that step):

1. **`pnpm test:coverage`** with empty Supabase/Sentry env overrides for the test job.
2. **Upload** `coverage/lcov.info` as artifact `coverage-lcov`.
3. **Separate `e2e` job** (`needs: release-gates`): install Playwright browsers, run `pnpm test:e2e` with:

```yaml
AUTH_DEV_PHONE_BYPASS_ENABLED: '1'
NODE_ENV: development
SENTRY_DSN: ''
NEXT_PUBLIC_SUPABASE_URL: ''
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ''
```

Use the repo’s existing action versions (`checkout@v6`, `pnpm/action-setup@v4`, `setup-node` with `.nvmrc`) — do not downgrade to older pins from drafts.

---

### Step 9 — Local verification

```bash
pnpm test
pnpm test:coverage    # lcov → coverage/lcov.info
pnpm test:e2e
pnpm verify
```

---

### Step 10 — PR

```bash
git add -A
git commit -m "test: setup Vitest/MSW/Playwright, auth unit+integration+e2e for /en/admin"
git push -u origin chore/tests-foundation
```

Open PR → `main`. Quote acceptance criteria below in the PR description.

---

## Files to add or modify

| Action | Path |
| ------ | ---- |
| Create | `vitest.config.ts` |
| Create | `playwright.config.ts` |
| Create | `tests/setup/setup-vitest.node.ts` |
| Create | `tests/setup/setup-vitest.dom.ts` |
| Create | `tests/setup/msw/handlers.ts` |
| Create | `tests/setup/msw/server.ts` |
| Create / rewrite | `tests/auth/phone.test.ts` |
| Create | `tests/auth/dev-auth.test.ts` |
| Create | `tests/auth/middleware.test.ts` |
| Create | `tests/e2e/admin.spec.ts` |
| Modify | `package.json` (scripts + devDependencies) |
| Modify | `pnpm-lock.yaml` |
| Modify | `.github/workflows/ci.yml` |

Do not touch `.env*` files.

---

## Acceptance criteria

- [ ] `pnpm test` — all Vitest projects green.
- [ ] `pnpm test:coverage` — thresholds met; `coverage/lcov.info` generated.
- [ ] `pnpm test:e2e` — both admin specs pass locally and in CI.
- [ ] `pnpm verify` — full gate green on the PR branch.
- [ ] `pnpm vocab:check` — no forbidden terms in new files.
- [ ] Middleware tests pass without mocking `@supabase/ssr`.
- [ ] E2E with dev-bypass cookie: URL stays on `/en/admin`, not `/sign-in`.

---

## Design notes

| Topic | Decision |
| ----- | -------- |
| Middleware integration | Test locale header + redirect / dev-bypass only; Supabase session path untouched. |
| MSW | `onUnhandledRequest: 'bypass'` so incidental fetches do not fail tests. |
| Coverage thresholds | 80% lines/statements/functions, 70% branches — may fail first run; fix by excluding generated barrels only if already listed in config. |
| Windows | Use `cross-env` in Playwright `webServer.command` when `process.platform === 'win32'`. |

---

## Follow-up (separate PRs)

- RTL tests for 1–2 UI primitives under `jsdom` project.
- MSW handlers for Supabase Auth 200/401 shapes.
- Migrate remaining `tests/**` off `tsx --test`.
- Codecov integration.
