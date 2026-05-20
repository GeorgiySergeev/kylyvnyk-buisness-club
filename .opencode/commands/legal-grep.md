# /legal-grep

Run the forbidden-vocabulary grep across the entire repo, ignoring the
allowlisted files. This is what CI runs on every PR.

## Usage

```
/legal-grep
```

## What this command does

1. Run `pnpm vocab:check`.
2. If any match: print file:line:match for each. Refuse to suggest
   "rephrasing" — that's the developer's call, not the agent's.
3. Confirm that `docs/GUARDRAILS.md` is the only file in `docs/` allowed
   to contain the forbidden terms (because it documents them).
4. Output: pass/fail + list of violations.
