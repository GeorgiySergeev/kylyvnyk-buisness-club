Отлично. Ниже — готовый «скелет» тестовой системы под ваш репозиторий: зависимости, конфиги, setup, первые unit/integration/E2E тесты и CI. Скопируйте файлы как есть и обновите package.json/CI. После этого у вас будут: быстрый локальный раннер (Vitest), покрытие, мок внешних сервисов (MSW), E2E (Playwright) и пороги покрытия в CI.

1) Установка зависимостей
- pnpm add -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom msw @playwright/test
- опционально (позже, если пойдете в интеграцию с Postgres): pnpm add -D testcontainers

2) Vitest: конфиг с двумя проектами (node/jsdom)
Создайте vitest.config.ts в корне:
```
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
  // параллельные "проекты" Vitest
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

3) Setup для Vitest и MSW
Создайте директории и файлы:
- tests/setup/setup-vitest.node.ts
```
import { server } from './msw/server';

// Глушим внешние HTTP в node-интеграциях
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

// Безопасные дефолтные ENV для тестов
process.env.SENTRY_DSN = '';
process.env.NEXT_PUBLIC_SUPABASE_URL = '';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = '';
process.env.AUTH_DEV_PHONE_BYPASS_ENABLED = process.env.AUTH_DEV_PHONE_BYPASS_ENABLED ?? '0';
```

- tests/setup/setup-vitest.dom.ts
```
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

- tests/setup/msw/handlers.ts
```
import { http, HttpResponse } from 'msw';

// Универсальные заглушки внешних сервисов
export const handlers = [
  // Sentry
  http.post(/sentry\.io\/api\/\d+\/envelope/, () => HttpResponse.json({}, { status: 200 })),
  // Plausible
  http.post(/plausible\.io\/api\/event/, () => HttpResponse.json({}, { status: 202 })),
  // Upstash
  http.all(/upstash\.io/, () => HttpResponse.json({ ok: true }, { status: 200 })),
  // Stripe (только чтобы не падало, реальных вызовов нет)
  http.all(/stripe\.com|api\.stripe\.com/, () => HttpResponse.json({}, { status: 200 })),
  // Supabase REST/Auth — заглушки без реального ответа
  http.all(/supabase\.co/, () => HttpResponse.json({}, { status: 200 })),
];
```

- tests/setup/msw/server.ts
```
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

4) Первые unit-тесты (auth/lib)
- tests/auth/phone.test.ts
```
import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber, phoneNumberSchema } from '@/features/auth/lib/phone';

describe('phone utils', () => {
  it('normalizePhoneNumber adds + and strips non-digits', () => {
    expect(normalizePhoneNumber(' 1 (555) 000-0003 ')).toBe('+15550000003');
    expect(normalizePhoneNumber('+38 099-123-45-67')).toBe('+380991234567');
  });

  it('phoneNumberSchema accepts valid E.164-like numbers', () => {
    const res = phoneNumberSchema.safeParse(' +1 (555) 000-0001 ');
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data).toBe('+15550000001');
    }
  });

  it('phoneNumberSchema rejects invalid', () => {
    for (const bad of ['12345', '+0123456', '+1 23', '+']) {
      const res = phoneNumberSchema.safeParse(bad);
      expect(res.success).toBe(false);
    }
  });
});
```

- tests/auth/dev-auth.test.ts
```
import { describe, it, expect } from 'vitest';
import { encodeDevPhoneAuthCookie, decodeDevPhoneAuthCookie } from '@/features/auth/lib/dev-auth';

describe('dev-auth cookie', () => {
  it('roundtrips phone through base64url', () => {
    const phone = '+15550000001';
    const enc = encodeDevPhoneAuthCookie(phone);
    expect(enc).toBeTypeOf('string');
    const dec = decodeDevPhoneAuthCookie(enc);
    expect(dec).toBe(phone);
  });

  it('returns null on invalid', () => {
    expect(decodeDevPhoneAuthCookie(undefined)).toBeNull();
    expect(decodeDevPhoneAuthCookie('%%%')).toBeNull();
  });
});
```

5) Интеграционные тесты: middleware
- tests/auth/middleware.test.ts
```
import { describe, it, expect, beforeEach } from 'vitest';
import middleware from '@/middleware';
import { NextRequest } from 'next/server';
import { encodeDevPhoneAuthCookie, DEV_PHONE_AUTH_COOKIE } from '@/features/auth/lib/dev-auth';

function makeRequest(path: string, cookie?: string) {
  const headers = new Headers();
  if (cookie) headers.set('cookie', cookie);
  return new NextRequest(`http://localhost${path}`, { headers });
}

describe('middleware', () => {
  beforeEach(() => {
    // Чистим ENV, чтобы ветка без Supabase ключей шла в редирект
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    process.env.AUTH_DEV_PHONE_BYPASS_ENABLED = '0';
  });

  it('sets x-locale for public route and does not block', async () => {
    const req = makeRequest('/en');
    const res = await middleware(req);
    expect(res.headers.get('x-locale')).toBe('en');
    // NextResponse.next() без редиректа => status 200 по умолчанию
    expect(res.status).toBe(200);
  });

  it('redirects protected route to sign-in when not authed and no dev bypass', async () => {
    const req = makeRequest('/en/m');
    const res = await middleware(req);
    expect(res.status).toBe(307); // redirect
    const loc = res.headers.get('location');
    expect(loc).toMatch(/^\/en\/sign-in\?/);
    expect(res.headers.get('x-locale')).toBe('en');
  });

  it('allows protected route with dev bypass cookie in non-production', async () => {
    process.env.AUTH_DEV_PHONE_BYPASS_ENABLED = '1';
    const cookie = `${DEV_PHONE_AUTH_COOKIE}=${encodeDevPhoneAuthCookie('+15550000001')}`;
    const req = makeRequest('/uk/m', cookie);
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-locale')).toBe('uk');
  });
});
```

Примечание: Vitest запускается в NODE_ENV=test, а ваш код разрешает dev-bypass при любом NODE_ENV, кроме production — это нам подходит.

6) Playwright: базовая настройка и smoke-тест
- Инициализация один раз: npx playwright install --with-deps
- Создайте playwright.config.ts в корне:
```
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
      'AUTH_DEV_PHONE_BYPASS_ENABLED=1 NODE_ENV=development pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
```

- tests/e2e/smoke.spec.ts
```
import { test, expect } from '@playwright/test';
import { encodeDevPhoneAuthCookie } from '../../src/features/auth/lib/dev-auth';

test('home opens', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.ok()).toBeTruthy();
});

test('protected route redirects to sign-in without cookie', async ({ page }) => {
  const res = await page.goto('/en/m');
  // Ожидаем редирект — Playwright следует за ним; проверим финальный URL содержит /sign-in
  expect(page.url()).toMatch(/\/en\/sign-in/);
});

test('protected route opens with dev-bypass cookie', async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'kclub_dev_phone_auth',
      value: encodeDevPhoneAuthCookie('+15550000001'),
      url: 'http://localhost:3000',
      httpOnly: false,
    },
  ]);
  const res = await page.goto('/ru/m');
  expect(res?.ok()).toBeTruthy();
  // На этом уровне хотя бы убеждаемся, что не ушли на /sign-in
  expect(page.url()).toMatch(/\/ru\/m/);
});
```

Если в проекте нет страниц /en/m|/ru/m — можете заменить на любой существующий защищённый путь, подпадающий под паттерн middleware: /^\/(en|ru|uk)\/(?:m|admin)/.

7) Обновите скрипты в package.json
Замените scripts на:
```
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest --config vitest.config.ts --project node --project jsdom",
    "test:watch": "vitest --watch --config vitest.config.ts --project node --project jsdom",
    "test:coverage": "vitest run --coverage",
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

8) GitHub Actions: разделите unit/integration и e2e
Создайте .github/workflows/ci.yml (или обновите существующий):
```
name: CI

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  unit-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm vocab:check
      - run: pnpm env:check
      - run: pnpm build
      - run: pnpm typecheck
      - name: Run unit/integration with coverage
        run: pnpm test:coverage
        env:
          SENTRY_DSN: ''
          NEXT_PUBLIC_SUPABASE_URL: ''
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ''
      - name: Upload coverage artifact
        uses: actions/upload-artifact@v4
        with:
          name: coverage-lcov
          path: coverage/lcov.info

  e2e:
    needs: unit-integration
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run E2E
        run: pnpm test:e2e
        env:
          AUTH_DEV_PHONE_BYPASS_ENABLED: '1'
          NODE_ENV: development
          SENTRY_DSN: ''
          NEXT_PUBLIC_SUPABASE_URL: ''
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ''
```

9) Политика покрытия
- Порог на старте: lines 80 / funcs 80 / branches 70 / statements 80 (задано в vitest.config.ts).
- Исключения уже прописаны (styles/assets/d.ts/index-реэкспорты).
- В дальнейшем повышайте пороги на 5–10% по мере роста.

10) Как работать команде
- Любая нетривиальная ветка условий в src/features/**/lib/*.ts — минимум 2–3 unit-теста на ветвление.
- Любой защищённый маршрут или middleware‑логика — 1 позитивный и 1 негативный интеграционный тест.
- Для новых UI-критических путей — добавить короткий E2E smoke.
- Все внешние HTTP — через MSW в Vitest и page.route() в Playwright при необходимости.
- Не храните настоящие ключи в ENV тестов/CI; всё перехватывается моками.

Готово. После коммита этих файлов запустите локально:
- pnpm test — быстрый прогон unit/integration
- pnpm test:coverage — с покрытием
- pnpm test:e2e — Playwright E2E
- pnpm verify — полный пайплайн как в CI

Могу подготовить PR с этими файлами и первыми тестами. Если ок — скажите название ветки (например, chore/tests-foundation) и какие страницы лучше взять для E2E smoke (если /en/m отсутствует, укажите существующий защищённый URL).