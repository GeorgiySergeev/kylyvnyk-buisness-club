# Phase 01 Context

## Scope

Phase 01 adds the non-breaking testing foundation described in `docs/TESTING.md`.
The goal is to introduce Vitest, MSW, Playwright smoke coverage, and a phase
context trail without replacing the existing `tsx --test` suite.

## Implemented

- Added exact test-tool versions for Vitest, coverage, Testing Library, MSW,
  Playwright, jsdom, and `cross-env`.
- Added parallel scripts:
  `test:legacy`, `test:vitest`, `test:unit`, `test:integration`,
  `test:component`, `test:coverage`, `test:e2e`, and `test:e2e:smoke`.
- Added version-compatible `vitest.config.ts` with four projects:
  `unit`, `integration`, `contract`, and `component`.
- Added `playwright.config.ts` for Chromium-based smoke coverage.
- Added shared MSW setup with strict unhandled-request failures.
- Added first migrated tests:
  `tests/unit/auth/phone.test.ts`,
  `tests/integration/middleware/access-control.test.ts`,
  `tests/contract/pii/public-card-dto.test.ts`,
  and `tests/e2e/smoke/public-routes.spec.ts`.
- Added the `component` project scaffold, but deferred the first component test
  until the repo gets a dedicated Vitest JSX path that does not fight the
  current Next-oriented TS setup.

## Decisions

- The legacy `tsx --test` suite remains active and is still part of `pnpm test`.
- Coverage is collected in Phase 01 but no repository-wide threshold is enforced
  yet.
- Browser smoke only verifies public routes and unauthenticated redirect
  behavior. Positive protected-route E2E with seeded personas is deferred to a
  later phase because middleware dev-bypass does not satisfy page-level auth.
- Phase context files live under `docs/testing-context/` to keep rollout notes
  out of the repository root.

## Verification Target

- `pnpm test:unit`
- `pnpm test:integration`
- `pnpm test:component`
- `pnpm test:coverage`
- `pnpm test`
- `pnpm test:e2e:smoke`

## Verification Result

Completed successfully on 2026-06-05:

- `pnpm test:unit` passed.
- `pnpm test:integration` passed.
- `pnpm test:component` passed with `--passWithNoTests` because the component
  project is scaffolded but not yet populated.
- `pnpm test:coverage` passed and generated `coverage/lcov.info`.
- `pnpm test` passed, including the legacy `tsx --test` suite plus the new
  Vitest suites.
- `pnpm test:e2e:smoke` passed for `/en`, `/en/directory`, and unauthenticated
  redirect on `/en/admin`.
- `pnpm verify` passed.

Observed caveats:

- Current Vitest coverage is intentionally baseline-only and still very low at
  repository level because only the first migrated slices are included.
- `pnpm verify` passed under Node `v22.22.3`, but the repo still declares
  `node: 20.x`, so the engine warning remains expected until validation runs on
  Node 20 in CI.
- Next.js emits the existing deprecation warning for `next lint`, and Sentry
  emits the existing `instrumentation-client.ts` migration warning. These are
  pre-existing platform warnings, not regressions from Phase 01.

## Next Phase Candidate

Phase 02 should migrate the remaining auth and billing `node:test` coverage to
Vitest, then add missing P0 tests for access control, verify-card, billing
reconciliation, and route/export contracts.
