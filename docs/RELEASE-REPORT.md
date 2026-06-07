# KCLUB MVP Release Report

Last refreshed: 2026-06-07.

## Release Candidate

This report is the Sprint 4 launch-readiness artifact for the current release
candidate branch. It summarizes gate evidence, release scope, known limitations,
and rollback notes for a controlled beta.

## Current Gate Evidence

Sprint 4 local evidence was captured on 2026-06-07:

- `pnpm verify` passed.
- `pnpm test:coverage` passed.
  - Statements: 6.46%.
  - Branches: 4.87%.
  - Functions: 5.93%.
  - Lines: 6.78%.
- `pnpm test:db` passed as an intentional skip because `TEST_DATABASE_URL` is
  not configured locally.
- `pnpm test:e2e:smoke` passed: 3/3 tests.
- `pnpm test:e2e:regression` passed: 3/3 tests.
- `pnpm test:a11y` passed: 1/1 smoke test.
- `pnpm test:visual` passed: 1/1 smoke test.

`pnpm test:db` is expected to skip unless `TEST_DATABASE_URL` points at a
disposable database whose name contains `test`, `ci`, or `scratch`.

The local workstation used Node v22.22.3, so every `pnpm` gate reported the
expected engine warning. The final tag/deploy gate should be repeated on Node
20.18.0 as declared in `.nvmrc`.

## Release Scope

- Public localized shell for `en`, `ru`, and `uk`.
- Public home, directory, legal, robots, sitemap, and verify-card routes.
- Phone-first Supabase Auth with development bypass disabled in production.
- Member dashboard, onboarding, digital card, profile, membership, and billing
  surfaces.
- Stripe webhook, checkout reconciliation, portal/cancel flows, and daily
  reconciliation cron.
- Admin guarded workspace with MFA decision coverage and export route
  contracts.
- Observability through Sentry and Plausible with PII-scrubbing contracts.

## Known Limitations

- Admin, VIP/BUS, business submission/moderation, subscription-state, and
  Business Introduction browser workflows are not yet fully persona-covered.
- DB migration smoke is opt-in until `TEST_DATABASE_URL` is provisioned in CI.
- Accessibility and visual suites are smoke-level only; full axe scans and
  screenshot baselines remain post-beta hardening.
- Performance smoke is not wired yet.
- Local runs on Node 22.x pass with an engine warning; the final release gate
  should run on Node 20.18.0 as declared in `.nvmrc`.

## Rollback Notes

- Revert the release commit or redeploy the previous known-good artifact if a
  launch-blocking regression appears after deployment.
- Do not run destructive DB commands during rollback. Migrations are append-only;
  use a forward-fix migration if schema state must change.
- Disable scheduled/manual nightly lanes rather than removing PR gates if a
  non-critical release-suite test flakes after launch.
- Keep `AUTH_DEV_PHONE_BYPASS_ENABLED` and `AUTH_DEV_2FA_BYPASS_ENABLED` empty
  in production during rollback and forward-fix testing.

## Deferred Backlog

- Seeded admin dashboard E2E with verified MFA.
- VIP/BUS dashboard state coverage.
- Business submission and moderation browser workflow.
- Business Introduction submission and moderation browser workflow.
- Full critical UI hard-coded string scan.
- Axe-based accessibility suite, visual baselines, and performance smoke.
