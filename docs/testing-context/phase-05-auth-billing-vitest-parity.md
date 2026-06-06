# Phase 05 Context

## Scope

Phase 05 starts Sprint 1 by moving the legacy auth and billing `node:test`
coverage into the Vitest unit project while keeping the remaining legacy runner
active for business, directory, introductions, i18n, and profile tests.

## Implemented

- Migrated the remaining auth legacy tests into `tests/unit/auth` and
  `tests/unit/admin`.
- Migrated the remaining billing legacy tests into `tests/unit/billing`.
- Kept the already-migrated auth and billing Vitest files in place.
- Removed `tests/auth/*.test.ts` and `tests/billing/*.test.ts` from the legacy
  runner.
- Updated `test:legacy` to cover only the remaining legacy domains.
- Updated `test:auth` to run the Vitest auth/admin unit slice.

## Decisions

- `test:legacy` remains active because 10 legacy `node:test` files still exist.
- The next migration group should be business, directory, introductions, i18n,
  and profile, with i18n likely becoming a contract test.
- Repository-wide coverage remains baseline-only.
- DB integration infrastructure is still pending and should be handled as a
  separate Sprint 1/Sprint 2 slice.

## Verification Target

- `pnpm test:unit`
- `pnpm test:auth`
- `pnpm test:legacy`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm test:e2e:smoke`
- `pnpm verify`

