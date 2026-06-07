# Release Status

Last refreshed: 2026-06-07.

## Baseline

- Branch: release candidate branch.
- Core local gates: `pnpm lint`, `pnpm vocab:check`, `pnpm env:check`,
  `pnpm build`, `pnpm typecheck`, and `pnpm test`.
- Combined local gate: `pnpm verify`.
- CI gate: `.github/workflows/ci.yml` runs the same release gate sequence on
  `pull_request` and pushes to `main`, plus unit/integration coverage and
  Playwright smoke.
- Current release plan: `docs/RELEASE-ROADMAP.md`.
- Historical context map: `docs/LEGACY-CONTEXT.md`.

## Release-Ready Surfaces

- Public localized shell for `en`, `ru`, and `uk`.
- Phone-first auth entry screens.
- Protected member dashboard route.
- Public verify-card route with PII-safe DTO tests.
- Public directory DTO with public-only key tests.
- Admin shell with guarded access and MFA decision tests.
- Admin operational tables for users, businesses, cards, introductions,
  memberships, catalog, references, audit, payment links, and subscriptions.
- Stripe billing: webhook handler with signature verification and
  idempotent event claim, membership lifecycle state machine, checkout
  and portal session creation, cancel VIP flow, subscription management
  UI, daily reconciliation cron, and 48 unit tests across 5 test files.
- Testing foundation through Phase 09: legacy runner retired, Vitest projects
  active, component coverage started, route contracts added, Playwright smoke
  isolated from unrelated local servers, scheduled/manual release suites wired,
  and first positive product workflow regressions added.
- System routes: `robots.txt` and `sitemap.xml` are implemented through Next
  metadata routes.
- `/verify-card` is a real lookup entry that redirects to the PII-safe
  `/verify-card/[number]` result route.

## Deferred Surfaces

- `TEST_DATABASE_URL` needs a disposable CI database secret before nightly DB
  migration smoke can exercise real Postgres instead of skipping.
- Positive browser workflows exist for member sign-up/onboarding/dashboard and
  verify-card lookup; admin, VIP/BUS, business submission/moderation,
  subscription-state, and Business Introduction workflows remain deferred.
- Axe-based accessibility, true visual snapshot baselines, and performance
  smoke remain deferred.
- Local final verification should be repeated on Node 20.18.0; this workstation
  often runs Node 22.x and reports an engine warning.

## Release Blockers

- `pnpm verify` must be green on the release branch.
- `pnpm test:coverage` and `pnpm test:e2e:smoke` must be green before release.
- GitHub Actions must have the required secrets for build-time DB and platform
  env vars before CI can be considered authoritative.
- If releasing from this branch, record the final command evidence in
  `docs/RELEASE-REPORT.md`.

## Smoke Evidence Command

After starting the built app with `pnpm start`, run:

```bash
pnpm smoke:routes
```

Expected result:

- Public routes return `200`.
- Guarded member/admin routes return redirects while unauthenticated.
- Verify-card may return `429` during repeated local enumeration checks.
