# Phase 03 Context

## Scope

Phase 03 extends the Vitest foundation into public verify-card contracts and
remaining P0 auth intent logic. The goal is to keep public PII-safe behavior
easy to verify by extracting small reusable helpers out of the route page and
covering them in the new test layer.

## Implemented

- Migrated phone auth intent rules into
  `tests/unit/auth/phone-auth-intent.test.ts`.
- Extracted shared verify-card `robots` metadata into
  `src/features/cards/lib/verify-card-metadata.ts`.
- Extracted verify-card presentation helpers into
  `src/features/cards/lib/verify-card-view.ts`.
- Updated both verify-card pages to consume the shared metadata contract.
- Updated the dynamic verify-card page to consume the extracted helper
  functions instead of keeping that logic inline.
- Added contract coverage for verify-card noindex/nofollow metadata in
  `tests/contract/pii/verify-card-metadata.test.ts`.
- Added unit coverage for verify-card helper behavior in
  `tests/unit/cards/verify-card-view.test.ts`.

## Decisions

- Phase 03 still keeps the legacy `node:test` suite intact; migrated coverage is
  additive only.
- Public route contract details are tested through small shared modules instead
  of importing full App Router page modules into Vitest.
- The verify-card page remains server-first, but its contract-critical helper
  logic now lives in plain modules that are easier to reuse and extend.

## Verification Target

- `pnpm test:unit`
- `pnpm test:coverage`
- `pnpm verify`

## Verification Result

Completed successfully on 2026-06-05:

- `pnpm test:unit` passed with new auth-intent and verify-card contract/helper
  coverage.
- `pnpm test:coverage` passed with the expanded unit, integration, and contract
  suites.
- `pnpm verify` passed end-to-end after a targeted import-sort autofix on the
  touched verify-card page.

Observed caveats:

- The local machine still reports the known Node engine warning because the repo
  expects Node 20 and this workstation is on Node 22.
- Repository-wide coverage remains intentionally baseline-only; the new tests
  improve focused P0 coverage, not the global percentage gate.
- `next lint` still reports pre-existing import-sort warnings in unrelated app
  files outside this phase scope.

## Next Phase Candidate

Phase 04 should target one of these two tracks:

- migrate additional legacy auth/billing/security pure-logic tests into the
  Vitest unit lane, or
- add contract and integration coverage for public/admin route-handler exports
  and webhook/access surfaces that still only rely on the legacy runner.
