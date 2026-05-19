
## Title

Seeds & Fixtures — bootstrapping data

## Objective

Provide minimal, realistic datasets for local dev and E2E:

- Countries/Cities (subset)
- Partner Categories (non–high-risk only)
- Sample Businesses (PUBLISHED/UNDER_REVIEW; Top/Recommended flags)
- Test Users (FREE/VIP/ADMIN) with optional Clerk linkage

## Prereqs

- DATABASE_URL set in .env.local
- Drizzle schema applied (pnpm db:migrate)
- Dev dependency to run TS scripts:
  - pnpm add -D tsx

## Order of seeding (recommended)

1) Countries/Cities
2) Categories
3) Users (optional; or rely on Clerk sync at runtime)
4) Businesses

## Commands (add to package.json)

```json
{
  "scripts": {
    "seed:geo": "tsx scripts/seed/countries-cities.ts",
    "seed:categories": "tsx scripts/seed/categories.ts",
    "seed:users": "tsx scripts/seed/users.ts",
    "seed:businesses": "tsx scripts/seed/businesses.ts",
    "seed:all": "pnpm seed:geo && pnpm seed:categories && pnpm seed:users && pnpm seed:businesses"
  }
}
```

## Notes

- Keep seeds idempotent via onConflictDoNothing or lookup-before-insert.
- Do not insert high-risk categories (crypto, gambling, adult, firearms, unlicensed finance, high-risk investments).
- Use placeholder emails (example.com) — no real PII.

---
