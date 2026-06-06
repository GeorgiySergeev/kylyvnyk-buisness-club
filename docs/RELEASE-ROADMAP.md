# KCLUB MVP Release Roadmap

Last refreshed: 2026-06-06.

## Purpose

This is the current planning source for the path from the present MVP state to a
controlled release. It supersedes the old sprint notes under `docs/sprints/`
and the bootstrap prompt sequencing for day-to-day execution.

The product is not release-complete yet. Core implementation is advanced, the
testing foundation is in place, and `pnpm verify` has been made green locally,
but release confidence still depends on context cleanup, remaining P0 test
migration, browser workflow QA, and release-gate hardening.

## Current Status

| Area | Status | Release meaning |
| --- | --- | --- |
| Core app routes | Mostly implemented | Public, member, admin, billing, legal, sitemap, and robots routes exist. |
| Auth stack | Supabase Auth | Old Clerk prompts and sprint docs are historical only. |
| Billing | Stripe implemented | Webhook/idempotency and reconciliation have coverage, but more P0 contract tests remain. |
| Testing | Phase 06 in progress | Legacy `node:test` runner is retired; remaining Sprint 1 work is DB integration and route-contract hardening. |
| CI | PR gates exist | Release gates, unit/integration, and E2E smoke run in CI. Nightly regression/a11y/visual/perf remain future work. |
| Documentation | Mixed | Current docs and historical bootstrap docs coexist; Sprint 0 separates them. |

## Sprint 0: Context Hygiene

Duration: 1-2 days.

Goals:

- Make the current release/testing/runbook docs the working context.
- Mark old scaffold prompts and sprint notes as historical.
- Remove stale guidance about Clerk, old test commands, missing robots/sitemap,
  and placeholder-only surfaces where the app has moved on.

Acceptance criteria:

- `docs/RELEASE-ROADMAP.md` exists and is linked from current status docs.
- `docs/LEGACY-CONTEXT.md` explains which docs/prompts are historical.
- `docs/TESTING.md`, `docs/RUNBOOK.md`, `docs/routes-audit.md`,
  `docs/user-flows.md`, and `prompts/META/INDEX.md` no longer direct agents to
  execute known-superseded context.
- Documentation-only changes pass the repository gates.

## Sprint 1: Testing Parity and P0 Contracts

Duration: 2-4 days.

Goals:

- Migrate the next legacy `node:test` group to Vitest, starting with auth and
  billing.
- Keep `test:legacy` until every legacy file has Vitest parity.
- Add missing route-handler and public-contract coverage for Stripe webhook,
  admin exports, verify-card, and public DTOs.
- Add an explicit DB integration path or document the temporary fallback if the
  isolated Postgres flow is not ready.

Acceptance criteria:

- `pnpm test`, `pnpm test:coverage`, and `pnpm test:e2e:smoke` pass.
- The legacy `node:test` file count is lower than the Sprint 0 baseline of 30.
- New P0 contracts have tests at the lowest useful layer.

## Sprint 2: Release Gates, Security, and Observability

Duration: 2-3 days.

Goals:

- Keep PR gates fast while adding nightly/pre-release lanes for regression,
  accessibility, visual, and performance checks.
- Audit security headers, CSP, Turnstile, rate limits, Stripe webhook signature
  and idempotency behavior.
- Verify Sentry scrubbing and Plausible no-PII conventions.
- Update `.env.example` and `docs/ENV.md` for any discovered env contract drift.

Acceptance criteria:

- CI does not depend on stale local servers or undocumented secrets.
- Known PII/security checks have an owner, a gate, or an explicit deferred item.
- Release-gate commands are documented in `docs/RUNBOOK.md`.

## Sprint 3: Product Workflow QA

Duration: 3-5 days.

Goals:

- Add seeded/persona browser coverage for member dashboard, admin dashboard,
  business submission/moderation, subscription states, and Business
  Introduction flows.
- Keep unauthenticated smoke separate from positive persona smoke.
- Decide `/verify-card` lookup page scope: implement the lookup or explicitly
  keep only `/verify-card/[number]` in MVP.
- Scan critical UI for hard-coded user-facing strings.

Acceptance criteria:

- Critical user workflows pass in browser automation.
- SPEC route map and actual product pages have no unresolved P0 mismatch.
- Known limitations are documented separately from release blockers.

## Sprint 4: Launch Readiness

Duration: 2-3 days.

Goals:

- Run the final release gate on Node 20.18.x with a clean `.next` state.
- Produce a short release report with green commands, deferred items, and
  rollback notes.
- Verify public, member, admin, billing, legal, robots/sitemap, observability,
  and PII-sensitive surfaces.

Acceptance criteria:

- `pnpm verify` passes on the release branch.
- `pnpm test:coverage` and `pnpm test:e2e:smoke` pass.
- The MVP is ready for a controlled release/beta without hidden legacy context
  contradicting the current implementation.

## Current Commands

```bash
pnpm lint
pnpm vocab:check
pnpm env:check
pnpm build
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm test:e2e:smoke
pnpm verify
```

`pnpm verify` remains the canonical release gate.
