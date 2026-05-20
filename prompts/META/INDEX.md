# Prompt Library — INDEX

This is the **only file** that defines execution order and which prompts supersede which. Agents (Opencode/Cursor/Claude/Codex) MUST consult this file before executing any block.

> Precedence rule: when two prompts touch the same files or the same domain concept, the one with the **higher phase number** wins. Older scaffolds stay in the repo for context but are marked `Superseded-By:` in their headers.

---

## Phases

| Phase | Folder                          | Purpose                                                       |
| ----- | ------------------------------- | ------------------------------------------------------------- |
| 0     | (this file + META/\*)           | Governance: style, naming, guidelines, contributing           |
| 1     | `step-1-blocks/B01..B19`        | Bootstrap scaffolds — minimal stubs to make the repo runnable |
| 2     | `step-2-drizzle-ddl/`           | Final DDL (replaces empty schemas in Phase 1)                 |
| 3     | `step-3-implementations/01..06` | Final implementations (replace scaffolds in Phase 1)          |
| 4     | `step-4-checklists/`            | Pre-merge, pre-deploy, security, a11y checklists              |

Execute strictly in phase order. Inside a phase, follow numeric order.

---

## Phase 0 — Governance (must be non-empty before any code is written)

| File                         | Status  |
| ---------------------------- | ------- |
| `META/INDEX.md` (this file)  | ✅      |
| `META/STYLE-GUIDE.md`        | ⬜ TODO |
| `META/NAMING-CONVENTIONS.md` | ⬜ TODO |
| `META/PROMPT-GUIDELINES.md`  | ⬜ TODO |
| `META/CONTRIBUTING.md`       | ⬜ TODO |

**Blocking:** do not run any Phase 1 prompt until all five above exist.

---

## Phase 1 — Bootstrap blocks (B01–B19)

Order is strict. Each block has 3–7 steps; run them in numeric order.

| Block | Name                       | Notes / Superseded-By                                                                       |
| ----- | -------------------------- | ------------------------------------------------------------------------------------------- |
| B01   | project-bootstrap          | —                                                                                           |
| B02   | design-system              | —                                                                                           |
| B03   | database-drizzle-base      | **`03-initial-empty-schemas.md` → Superseded-By: step-2/README.md**                         |
| B04   | auth-clerk-rbac            | Scaffold; **superseded by step-3/01-auth-clerk/** for handlers and middleware               |
| B05   | billing-stripe             | Scaffold; **superseded by step-3/02-stripe-billing/** for webhook + handlers                |
| B06   | routing-i18n               | Locale set = `['en']` for MVP. RU/UK behind a Phase-2 ADR.                                  |
| B07   | marketing-ui               | —                                                                                           |
| B08   | landing-home               | —                                                                                           |
| B09   | catalog                    | Scaffold; **superseded by step-3/04-business-crud/** for forms & moderation                 |
| B10   | card-verify                | `03-verify-card-public-route.md` — see Patch-08 (no-store + revalidateTag + Turnstile + RL) |
| B11   | member-business-dashboards | Scaffold; **superseded by step-3/05-digital-club-card/** for card rendering                 |
| B12   | admin                      | Scaffold; **superseded by step-3/06-admin-tables-tanstack/**                                |
| B13   | legal-compliance-pages     | —                                                                                           |
| B14   | security-hardening         | —                                                                                           |
| B15   | i18n-content               | Locales: `['en']` MVP                                                                       |
| B16   | testing-qa                 | —                                                                                           |
| B17   | observability-analytics    | Sentry `beforeSend` scrubber required (see SECURITY.md §PII)                                |
| B18   | ci-cd-environments         | CI must include forbidden-vocab grep + i18n-diff                                            |
| B19   | seed-and-fixtures          | Seeds must NOT contain real PII; use Faker with fixed seed                                  |

---

## Phase 2 — Drizzle DDL (`step-2-drizzle-ddl/`)

Run AFTER Phase 1 reaches the end of B03. This phase commits the actual `/src/db/schema/*.ts` files. Replaces `B03/03-initial-empty-schemas.md`.

Required patches before commit (see Phase 5 — Patches):

- **Patch-04:** `profiles.countryId` → `integer` (FK to `countries.id`) for join parity with `businesses`.
- **Patch-05:** move all `relations()` declarations to `src/db/schema/_relations.ts` to break circular imports.
- **Patch-06:** memberships uniqueness — choose one model and document it (see BILLING-FLOWS.md).

---

## Phase 3 — Implementations (`step-3-implementations/`)

| Folder                      | Replaces       | Notes / Patches                                                                                                |
| --------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| `01-auth-clerk/`            | B04 step 02–06 | **Patch-01:** `await auth()` everywhere                                                                        |
| `02-stripe-billing/`        | B05 step 01–06 | **Patch-02:** items-level `current_period_end`; **Patch-03:** `INSERT ... ON CONFLICT DO NOTHING RETURNING id` |
| `03-forms-rhf-zod/`         | —              | —                                                                                                              |
| `04-business-crud/`         | B09            | `partnerOffers.visibility` is admin-only                                                                       |
| `05-digital-club-card/`     | B11 step 01–04 | —                                                                                                              |
| `06-admin-tables-tanstack/` | B12            | —                                                                                                              |

---

## Phase 4 — Checklists (`step-4-checklists/`)

Run before every merge and every deploy. Treat as DoD gates, not docs.

---

## Phase 5 — Patches (applied to existing prompts before any agent run)

| Patch ID | Target file                                                                                    | Risk fixed                                                        |
| -------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Patch-01 | `step-1-blocks/B04-auth-clerk-rbac/03-roles-and-profile-attributes.md`                         | R5: Clerk v6 `auth()` is async                                    |
| Patch-02 | `step-1-blocks/B05-billing-stripe/04-webhook-endpoint-and-idempotency.md` (read of period_end) | R7: Stripe v17 moved `current_period_end` to items                |
| Patch-03 | same file (idempotency insert)                                                                 | R20: race-safe idempotency via `ON CONFLICT DO NOTHING RETURNING` |
| Patch-04 | `step-2-drizzle-ddl/README.md` — `profiles.countryId`                                          | R4: type mismatch with `businesses.countryId`                     |
| Patch-05 | `step-2-drizzle-ddl/README.md` — relations extraction                                          | R5: circular imports                                              |
| Patch-08 | `step-1-blocks/B10-card-verify/03-verify-card-public-route.md`                                 | R8 + R9: stale cache + enumeration on public PII endpoint         |

Patch text lives in this folder under `META/PATCHES/`. Apply patches with `git apply` or copy-paste; do NOT regenerate the targeted prompts.

---

## How an agent uses this file

1. Read `/AGENTS.md`.
2. Read `/prompts/META/INDEX.md` (this file).
3. Apply all patches listed in Phase 5 to the prompts under `/prompts/META/PATCHES/_` before reading any block.
4. Execute Phase 1 blocks in order, skipping Superseded-By items only when their replacement in Phase 2/3 is about to run.
5. After Phase 1's last superseded step, jump to the replacing Phase 2/3 step.
6. End of every block: run Phase 4 checklists relevant to the surface touched.
