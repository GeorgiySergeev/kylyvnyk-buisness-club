# /verify-schema

Sanity-check that the Drizzle schema in `/src/db/schema/*.ts` matches the
database without applying anything.

## Usage

```
/verify-schema
```

## What this command does

1. Run `pnpm db:generate` in a dry-run mode (drizzle-kit defaults to
   generating a new migration file — capture the would-be output).
2. If the generated diff is non-empty: report what would change. Do NOT
   commit the migration file. Suggest next steps:
   - If intended → run `pnpm db:generate` for real, review the SQL,
     commit both schema + migration.
   - If unintended → revert the schema edit.
3. Also run `madge --circular src/db/schema` to confirm no circular
   imports were introduced (Patch-05 invariant).
4. Output: human-readable summary, no diffs to apply.
