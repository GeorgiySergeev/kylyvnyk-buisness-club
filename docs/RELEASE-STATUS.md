# Release Status

Last refreshed: 2026-05-28.

## Baseline

- Branch: `main`.
- Core local gates: `pnpm lint`, `pnpm vocab:check`, `pnpm env:check`,
  `pnpm build`, `pnpm typecheck`, and `pnpm test`.
- Combined local gate: `pnpm verify`.
- CI gate: `.github/workflows/ci.yml` runs the same release gate sequence on
  `pull_request` and pushes to `main`.

## Release-Ready Surfaces

- Public localized shell for `en`, `ru`, and `uk`.
- Phone-first auth entry screens.
- Protected member dashboard route.
- Public verify-card route with PII-safe DTO tests.
- Public directory DTO with public-only key tests.
- Admin shell with guarded access and MFA decision tests.
- Admin operational tables for users, businesses, cards, introductions,
  memberships, catalog, references, audit, payment links, and subscriptions.

## Deferred Surfaces

- Billing remains deferred for this release. See `docs/BILLING-FLOWS.md`.
- Production e2e/browser automation remains manual until Playwright is wired
  into CI with stable test accounts and environment secrets.

## Release Blockers

- `pnpm verify` must be green on the release branch.
- GitHub Actions must have the required secrets for build-time DB and platform
  env vars before CI can be considered authoritative.
- Billing must not be described as release-ready until the webhook slice lands
  or remains explicitly deferred.

## Smoke Evidence Command

After starting the built app with `pnpm start`, run:

```bash
pnpm smoke:routes
```

Expected result:

- Public routes return `200`.
- Guarded member/admin routes return redirects while unauthenticated.
- Verify-card may return `429` during repeated local enumeration checks.
