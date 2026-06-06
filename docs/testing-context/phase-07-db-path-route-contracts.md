# Phase 07 Context

## Scope

Phase 07 continues Sprint 1 after the legacy runner retirement by adding an
opt-in DB migration integration path and hardening admin export route contracts.

## Implemented

- Added a separate Vitest `db` project and `pnpm test:db`.
- Added `TEST_DATABASE_URL` as an optional CI/pre-release env var.
- Added a migration smoke test that applies committed `drizzle/*.sql` files in
  order against a disposable test database.
- Added guardrails so `TEST_DATABASE_URL` must target a database whose name
  contains `test`, `ci`, or `scratch`.
- Added admin export route contract tests for unauthorized access, missing MFA,
  CSV response headers, filtered output, and audit payload.

## Decisions

- `test:db` is not part of the default PR `pnpm test` gate until a disposable
  database is provisioned in CI.
- Current migrations are public-schema oriented, so the first DB integration
  path uses an isolated database rather than a shared schema.
- Repository-wide coverage remains baseline-only.

## Verification Target

- `pnpm env:check`
- `pnpm test:unit`
- `pnpm test:db` without `TEST_DATABASE_URL` skips safely.
- `pnpm test`
- `pnpm test:coverage`
- `pnpm test:e2e:smoke`
- `pnpm verify`

