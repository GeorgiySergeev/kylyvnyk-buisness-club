# Skill: Executing B0X prompt blocks

## The hierarchy

```
Phase 0: Governance (META files) — must exist before any code
Phase 1: Bootstrap blocks B01–B19 — scaffolds
Phase 2: step-2-drizzle-ddl — final DDL (replaces B03 schemas)
Phase 3: step-3-implementations — final code (replaces B04/B05/B09–B12 scaffolds)
Phase 4: step-4-checklists — pre-merge/pre-deploy gates
```

Always check INDEX.md first. B03/03 is superseded by step-2.
B04 scaffold is superseded by step-3/01-auth-clerk.

## Execution pattern (copy-paste for every block)

```
Step 0: git status → must be clean (no uncommitted changes)
Step 1: Read INDEX.md → confirm block is not superseded
Step 2: Load applicable patches from PATCHES/
Step 3: Read block README + step file
Step 4: Check Inputs (preconditions)
Step 5: Propose plan (files list) → wait for user OK
Step 6: Implement → show diffs
Step 7: Run verification command
Step 8: If green → suggest commit message
```

## What "verification command" means

Each step file has a `## Verification command` section.
Run THAT command, not a generic one.
If the step has no verification command, default to:

```bash
pnpm lint && pnpm typecheck && pnpm build
```

## Current MVP block order (without Stripe)

```
B01 → B02 → B03 → B04 → B06 → B08 → B09 → B11 → B07 → B12-MVP → B10 → B19
```

B05 (Stripe) is SKIPPED for MVP.
B13 (legal pages) is done last.
B14 (security hardening) is done before B10 (verify-card is public).
B15 (i18n) is en-only, already configured in B02.
B16–B18 (testing, CI, cd) are done last.

## Idempotency rule

Every block must be re-runnable safely.
If you run B03 twice, the second run must produce no diff (or a safe one).
Seed script clears tables before inserting — that's the idempotency pattern.
Migrations are append-only — re-running migrate is always safe.
