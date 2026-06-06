# Release Status

Last refreshed: 2026-06-06.

## Baseline

- Branch: `main`.
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
- Testing foundation through Phase 04: legacy runner preserved, Vitest projects
  active, component coverage started, route contracts added, and Playwright
  smoke isolated from unrelated local servers.
- System routes: `robots.txt` and `sitemap.xml` are implemented through Next
  metadata routes.

## Deferred Surfaces

- Legacy `node:test` migration to Vitest is incomplete.
- Positive persona-based browser workflows remain Sprint 3 work.
- Isolated Postgres/schema integration tests remain Sprint 1/Sprint 2 work.
- Nightly/pre-release regression, accessibility, visual, and performance lanes
  remain release-hardening work.

## Release Blockers

- `pnpm verify` must be green on the release branch.
- `pnpm test:coverage` and `pnpm test:e2e:smoke` must be green before release.
- GitHub Actions must have the required secrets for build-time DB and platform
  env vars before CI can be considered authoritative.

## Smoke Evidence Command

After starting the built app with `pnpm start`, run:

```bash
pnpm smoke:routes
```

Expected result:

- Public routes return `200`.
- Guarded member/admin routes return redirects while unauthenticated.
- Verify-card may return `429` during repeated local enumeration checks.
