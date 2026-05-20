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
