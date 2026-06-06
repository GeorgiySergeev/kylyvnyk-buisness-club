# Prompt Library Index

Last refreshed: 2026-06-06.

This repository keeps the prompt library for provenance, but the MVP has moved
beyond the original bootstrap sequence. Do not execute old prompts literally
unless a current source explicitly asks for that exact file.

Current precedence for implementation work:

1. `AGENTS.md`
2. `docs/STACK-DECISION.md`
3. `docs/SPEC.md`
4. `docs/RELEASE-ROADMAP.md`
5. `docs/TESTING.md`
6. Live source code and tests
7. Prompt files marked as current by this index
8. Historical prompts and sprint notes

## Current Execution Status

| Area | Current status | Source of truth |
| --- | --- | --- |
| Stack | Next.js 15, React 19, Supabase Auth, Drizzle, Stripe, next-intl | `docs/STACK-DECISION.md` |
| Product scope | MVP routes and role model | `docs/SPEC.md` |
| Release planning | Active Sprint 0-4 roadmap | `docs/RELEASE-ROADMAP.md` |
| Testing | Phase 04 in progress; legacy runner preserved | `docs/TESTING.md`, `docs/testing-context/` |
| Legacy handling | Historical prompts are not execution plans | `docs/LEGACY-CONTEXT.md` |

## Phase Map

| Phase | Folder | Status |
| --- | --- | --- |
| 0 | `META/*` | Historical governance; files exist for reference. |
| 1 | `step-1-blocks/B01..B19` | Bootstrap scaffolds; many are superseded. |
| 2 | `step-2-drizzle-ddl/` | DDL reference; compare with live schema before use. |
| 3 | `step-3-implementations/` | Implementation prompts; compare with live code before use. |
| 4 | `step-4-checklists/` | Checklist references; use with current docs and code. |

## Superseded or Historical Blocks

| Block | Status | Current handling |
| --- | --- | --- |
| B03 database bootstrap | Superseded | Use live Drizzle schema and `step-2-drizzle-ddl/README.md` only as reference. |
| B04 auth-clerk-rbac | Superseded | Current app uses Supabase Auth. Do not implement Clerk prompts. |
| B05 billing-stripe | Historical scaffold | Stripe is implemented; use live billing code and tests. |
| B09 catalog | Historical scaffold | Use live business, directory, and admin modules. |
| B10 card-verify | Partially historical | Use live verify-card code and PII contract tests. |
| B11 member-business-dashboards | Historical scaffold | Use live member dashboard/card/subscription modules. |
| B12 admin | Historical scaffold | Use live admin modules and route contracts. |
| B16 testing-qa | Historical bootstrap | Use `docs/TESTING.md` and `docs/testing-context/phase-04-p0-hardening.md`. |
| B17 observability | Partially complete | Audit against live Sentry/Plausible implementation in Sprint 2. |
| B18 CI/CD | Partially complete | Current CI has release-gates, unit/integration, and E2E smoke; nightly/pre-release lanes remain. |
| B19 seed-fixtures | Partially complete | Use live seed script and deterministic safe fixtures. |

## Agent Rules

- Start from current docs and live code.
- Quote conflicts when a prompt disagrees with `docs/STACK-DECISION.md` or
  `docs/SPEC.md`; current docs win.
- Do not migrate away from Supabase Auth because an old prompt mentions Clerk.
- Do not remove `test:legacy` until Vitest parity is proven.
- Do not introduce a repository-wide 80% coverage gate before domain ratchets
  are established.
- Keep new release planning in `docs/RELEASE-ROADMAP.md`.
