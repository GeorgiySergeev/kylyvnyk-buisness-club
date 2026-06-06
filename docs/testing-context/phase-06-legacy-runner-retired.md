# Phase 06 Context

## Scope

Phase 06 finishes the legacy runner migration by moving the remaining
`node:test` files into Vitest projects and removing `test:legacy` from the
default test command.

## Implemented

- Migrated business schema/slug tests to `tests/unit/business`.
- Migrated introduction schema and status logic tests to
  `tests/unit/introductions`.
- Migrated profile/dashboard/avatar tests to `tests/unit/profile`.
- Migrated public business DTO coverage to `tests/contract/pii`.
- Migrated message key parity to `tests/contract/i18n`.
- Removed the remaining legacy `tests/*/*.test.ts` files from the old folders.
- Updated `pnpm test` to run Vitest projects only.
- Removed `test:legacy` from `package.json`.

## Decisions

- `tsx` remains installed because it is still used by non-test scripts such as
  database seed execution.
- Repository-wide coverage remains baseline-only.
- The next Sprint 1 item is not more runner migration; it is DB integration
  infrastructure and remaining route-handler contract hardening.

## Verification Target

- `rg -l "node:test" tests` returns no files.
- `pnpm test:unit`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm test:e2e:smoke`
- `pnpm verify`

