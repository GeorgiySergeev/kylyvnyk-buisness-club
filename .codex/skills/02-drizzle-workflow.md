# Skill: Drizzle ORM workflow in Codex sessions

## Two URLs, never mix them

| Var                   | Port | Mode                  | Used by          |
| --------------------- | ---- | --------------------- | ---------------- |
| `DATABASE_URL`        | 6543 | PgBouncer transaction | App runtime      |
| `DATABASE_URL_DIRECT` | 5432 | Direct session        | drizzle-kit only |

`drizzle.config.ts` uses `DATABASE_URL_DIRECT`.
`src/db/client.ts` uses `DATABASE_URL` with `prepare: false`.

## Add a column workflow

```bash
# 1. Edit schema file
# 2. Generate migration
pnpm db:generate
# 3. INSPECT the SQL before applying
cat drizzle/NNNN_*.sql
# 4. Verify no DROP/TRUNCATE in the SQL
grep -E "DROP|TRUNCATE" drizzle/NNNN_*.sql  # must be empty
# 5. Apply
pnpm db:migrate
# 6. Commit BOTH schema + migration in same commit
```

## Rename column (drizzle-kit can't detect)

```bash
pnpm db:generate  # will generate DROP + ADD
# EDIT the SQL manually:
# Replace:
#   ALTER TABLE "x" DROP COLUMN "old_name";
#   ALTER TABLE "x" ADD COLUMN "new_name" ...;
# With:
#   ALTER TABLE "x" RENAME COLUMN "old_name" TO "new_name";
pnpm db:migrate
```

## Circular import prevention

```
❌ user.ts imports profile.ts
❌ profile.ts imports user.ts
✅ _relations.ts imports both user.ts AND profile.ts
✅ Table files import only: drizzle-orm/pg-core + their own enums
```

## Check for circular imports

```bash
npx madge --circular src/db/schema
# Must output: "No circular dependency found!"
```

## Query patterns

```ts
// Simple lookup
db.query.users.findFirst({
  where: eq(users.clerkUserId, clerkId),
});

// With relations
db.query.businesses.findMany({
  where: and(eq(businesses.status, 'PUBLISHED'), isNull(businesses.deletedAt)),
  with: { category: true, country: true },
  orderBy: [desc(businesses.isTopPartner), desc(businesses.createdAt)],
  limit: 12,
});

// Complex: use select()
db.select({ count: count() }).from(businesses).where(eq(businesses.status, 'PENDING'));
```

## Never do

```ts
❌ db.execute(sql`DROP TABLE users`)  // destructive raw SQL
❌ new postgres(env.DATABASE_URL)    // second client instance
❌ drizzle-kit push                  // disabled in package.json
❌ import { db } from anywhere except @/db/client
```
