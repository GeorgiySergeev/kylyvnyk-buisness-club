# Legacy Context Map

Last refreshed: 2026-06-06.

## Purpose

This file separates historical planning material from the current execution
context. Do not delete the prompt library or old sprint notes: they remain
useful as provenance. Do not execute them literally unless a current document
explicitly says to do so.

Current execution sources:

1. `AGENTS.md`
2. `docs/STACK-DECISION.md`
3. `docs/SPEC.md`
4. `docs/RELEASE-ROADMAP.md`
5. `docs/TESTING.md`
6. `docs/RUNBOOK.md`
7. `prompts/META/INDEX.md`

## Historical or Superseded Material

| Path | Status | Current replacement |
| --- | --- | --- |
| `docs/sprints/*.md` | Historical sprint drafts | `docs/RELEASE-ROADMAP.md` |
| `docs/context/context.md` | Historical compact context | This file and `docs/RELEASE-ROADMAP.md` |
| `docs/CONTEXT.md` | Historical pinned prompt context | `AGENTS.md` plus current docs |
| Auth-specific sections in `docs/DESIGN.md` | Historical UI auth notes | Supabase Auth screens and current route code |
| `prompts/META/step-1-blocks/B03-*` | Bootstrap database scaffold | `prompts/META/step-2-drizzle-ddl/README.md` and live schema |
| `prompts/META/step-1-blocks/B04-*` | Old Clerk-oriented auth scaffold | Supabase Auth implementation and `docs/STACK-DECISION.md` ADR-011 |
| `prompts/META/step-1-blocks/B05-*` | Stripe scaffold | Live billing code, `docs/BILLING-FLOWS.md`, and tests |
| `prompts/META/step-1-blocks/B09-*` | Business scaffold | Live business/admin modules |
| `prompts/META/step-1-blocks/B11-*` | Member/card scaffold | Live member/card modules |
| `prompts/META/step-1-blocks/B12-*` | Admin scaffold | Live admin modules |
| `prompts/META/step-1-blocks/B16-testing-qa/06-tests-foundation-init-pr.md` | Historical testing bootstrap | `docs/TESTING.md` and `docs/testing-context/` |

## Rules for Agents

- Treat old prompts as reference material, not as implementation instructions.
- Prefer current source files and current docs over old prompt text.
- If old docs mention Clerk, MVP without Stripe, missing robots/sitemap, or old
  test commands, assume the old doc is stale unless a current source confirms it.
- Preserve the legacy `tsx --test` suite during migration; remove it only after
  Vitest parity is proven.
- Keep new release planning in `docs/RELEASE-ROADMAP.md`, not in old sprint
  files.
