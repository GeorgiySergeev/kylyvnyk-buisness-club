# Phase 04 Context

## Scope

Phase 04 hardens the Phase 01-03 testing foundation by making local browser
smoke deterministic, enabling the first real component test, and expanding P0
billing and route contract coverage without removing the legacy `tsx --test`
suite.

## Implemented

- Moved Playwright smoke to a dedicated default port (`3101`) and disabled
  local reuse of unrelated existing servers.
- Added the first component test for `Button`, covering accessible rendering,
  loading state, and `asChild` link semantics.
- Included the component project in `test:vitest` and `test:coverage` now that
  the scaffold has real coverage.
- Expanded Vitest billing reconciliation coverage with additional legacy P0
  scenarios.
- Added Stripe webhook route contract tests for missing-signature and duplicate
  event behavior.

## Decisions

- `test:legacy` remains active until all legacy `node:test` files have Vitest
  parity.
- Browser smoke still covers only public routes and unauthenticated redirect
  behavior; seeded positive role-aware E2E remains a later phase.
- Coverage remains baseline-only at repository level.

## Verification Target

- `pnpm test:component`
- `pnpm test:unit`
- `pnpm test:coverage`
- `pnpm test:e2e:smoke`
- `pnpm test`
- `pnpm verify`

## Verification Result

Completed successfully on 2026-06-06:

- `pnpm test:component` passed with the new `Button` component tests.
- `pnpm test:unit` passed with expanded billing and webhook contract coverage.
- `pnpm test:integration` passed.
- `pnpm test:coverage` passed with component coverage included.
- `pnpm test` passed, including legacy `tsx --test`, Vitest unit/contract,
  integration, and component projects.
- `pnpm test:e2e:smoke` passed on the dedicated Playwright port.
- `pnpm verify` passed after clearing a stale `.next` build artifact and
  stopping an old local Next process on port `3000`.

Observed caveats:

- Local verification still ran on Node `v22.22.3`, while the repo declares
  Node `20.18.0`.
- Existing import-sort lint warnings remain in unrelated app/layout files.
- Existing Next/Sentry deprecation warnings remain unchanged.
