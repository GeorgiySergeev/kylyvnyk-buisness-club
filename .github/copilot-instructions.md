# Copilot Instructions

GitHub Copilot reads this file as repo-wide hints. The full ruleset is
in `/AGENTS.md`; this file is a compressed summary that fits Copilot's
context window.

## Stack (locked, see docs/STACK-DECISION.md)

- Next.js 15 App Router + React 19 + TS 5 strict
- Tailwind v4 CSS-first, shadcn/ui
- Drizzle ORM ^0.36 on Supabase Postgres (connection string only)
- Clerk ^6 (auth() is async — `await auth()`)
- Stripe ^17, apiVersion pinned at `2024-12-18.acacia`
- next-intl ^3, locales: ['en'] at MVP
- Upstash Redis for rate limit; Cloudflare Turnstile for CAPTCHA
- Sentry + Plausible

## Conventions

- Default to Server Components. `"use client"` only for handlers, hooks,
  browser APIs, or libraries that require it.
- `import "server-only"` on every server-only module.
- Zod validation on every Server Action input.
- `current_period_end` is on `subscription.items.data[0]`, NOT on the
  subscription root (Stripe API 2024-12-\*).
- Drizzle relations live in `src/db/schema/_relations.ts` to avoid
  circular imports.
- DB queries pass through `src/db/client.ts` only; never instantiate
  a second `postgres()` client.

## Forbidden

- MLM, affiliate, referral commission, passive income, earnings, wallet,
  crypto, gambling, casino, adult, firearms — see /docs/GUARDRAILS.md.
- Adding fields to `/verify-card` response beyond:
  `number, memberName, memberType, status, expiresAt`.
- `pnpm db:push` against any shared DB. Use migrations.
- Hard-coded user-facing strings. Use next-intl `t()`.
- Arbitrary hex colors. Use Tailwind tokens (`bg-bg`, `text-accent`, …).

## When generating tests

- Unit: Vitest. File suffix `.spec.ts`.
- e2e: Playwright. File suffix `.e2e.ts` under `/e2e/`.
- Every public route gets a PII-shape assertion test.

For anything else, defer to `/AGENTS.md`.

---

## Quick commands (build / lint / test)

- Install dependencies: pnpm install (pnpm@9.x required)
- Dev server: pnpm dev
- Build: pnpm build
- Start (production): pnpm start
- Lint: pnpm lint
- Typecheck: pnpm typecheck
- Format: pnpm format
- Full verification (local CI run): pnpm verify

Test helpers
- Run all tests: pnpm test
- Run grouped tests (example): pnpm test:auth
- Run a single test file directly: npx tsx --test tests/auth/specific.test.ts

Database
- Generate DDL: pnpm db:generate
- Run migrations: pnpm db:migrate
- Seed local DB: pnpm db:seed
- db:push is intentionally disabled; use migrations.

---

## High-level architecture (short)

- Single Next.js 15 application (App Router) with TypeScript 5 + React 19.
- Server-first: default to React Server Components; use `"use client"` only when necessary.
- Styling: Tailwind v4 + shadcn/ui + Radix.
- ORM & DB: Drizzle ORM + drizzle-kit, Postgres hosted on Supabase (connection string only).
- Auth: Supabase (`@supabase/ssr`, `@supabase/supabase-js`).
- Payments: Stripe (pinned apiVersion).
- Rate-limiting: Upstash Redis; Bot defense: Cloudflare Turnstile.
- Observability: Sentry + Plausible.

See /docs/ARCHITECTURE.md and /docs/STACK-DECISION.md for diagrams and ADRs.

---

## Key conventions (repo-specific)

- Source of truth: /AGENTS.md. Always consult it for policy, PII, and DoD.
- Server-only modules: include `import "server-only"` at the top.
- Server Actions & route handlers: follow auth → Zod parse → rate-limit/Turnstile → business logic → audit pattern.
- Zod: validate every Server Action input.
- DB schema & relations: keep Drizzle schema files in src/db/schema/_ and relations in _relations.ts.
- Use src/db/client.ts for all DB access; do not instantiate additional postgres() clients.
- No hard-coded user-facing strings — use next-intl namespaces.
- Forbidden vocabulary (CI-checked): MLM, affiliate, referral commission/bonus, passive income, wallet, crypto, gambling, casino, adult, firearms. See /docs/GUARDRAILS.md.
- Tests:
  - Unit: Vitest, file suffix `.spec.ts`.
  - E2E: Playwright, file suffix `.e2e.ts` under /e2e/.
  - Public routes: include a PII-shape assertion test.
- Dependency rules: do not run `pnpm add` without explicit version and approval; do not upgrade core framework without ADR.

---

If you'd like, this file can be extended with quick shortcuts (e.g., single-test scripts) or an MCP server configuration for Playwright test runs. Let me know which.
