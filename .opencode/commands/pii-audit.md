# /pii-audit

Audit every public route for PII leakage. Run before any release.

## Usage

```
/pii-audit
```

## What this command does

1. Find every file under `app/(public)/**/page.tsx` and `app/api/**/route.ts`.
2. For each, list:
   - What data it returns.
   - Whether it has a DTO mapping (not a raw DB row spread).
   - Whether there is a Playwright test asserting the response key set.
3. Cross-reference with `AGENTS.md §5` (PII contracts).
4. Output: table with one row per public surface; any row with a missing
   DTO or missing test is flagged ⚠️.
5. Suggest the exact test code for any unflagged surface.
