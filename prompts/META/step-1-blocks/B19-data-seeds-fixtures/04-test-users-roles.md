# 04-test-users-roles.md

## Title

Seed — Test Users (FREE/VIP/ADMIN) linkage

## Objective

Create test DB users linked to Clerk test accounts (optional) or shadow users for local dev. If Clerk IDs are not provided, fallback to dev-* placeholders.

## Env (optional)

- TEST_ADMIN_CLERK_USER_ID
- TEST_VIP_CLERK_USER_ID
- TEST_FREE_CLERK_USER_ID

## File

scripts/seed/users.ts

```ts
import 'dotenv/config';
import { db } from '@/lib/db';
import { users } from '@/db/schema/user';
import { memberships } from '@/db/schema/membership';

async function ensureUser(clerkUserId: string, email: string, isAdmin = false) {
  const inserted = await db
    .insert(users)
    .values({ clerkUserId, email, isAdmin, status: 'ACTIVE' as any })
    .onConflictDoNothing()
    .returning({ id: users.id });

  if (inserted[0]?.id) return inserted[0].id;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(users.clerkUserId.eq(clerkUserId as any)); // fallback, some drizzle versions allow .eq; if not, use eq() helper.

  return existing[0]?.id ?? null;
}

async function main() {
  const adminClerk = process.env.TEST_ADMIN_CLERK_USER_ID || 'dev-admin';
  const vipClerk = process.env.TEST_VIP_CLERK_USER_ID || 'dev-vip';
  const freeClerk = process.env.TEST_FREE_CLERK_USER_ID || 'dev-free';

  const adminId = await ensureUser(adminClerk, 'admin@example.com', true);
  const vipId = await ensureUser(vipClerk, 'vip@example.com', false);
  const freeId = await ensureUser(freeClerk, 'free@example.com', false);

  if (vipId) {
    await db
      .insert(memberships)
      .values({
        userId: vipId,
        type: 'VIP' as any,
        status: 'ACTIVE' as any,
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
      })
      .onConflictDoNothing();
  }

  console.log('✓ Seeded users (ADMIN/VIP/FREE) and VIP membership');
}

main().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
```

## Note

- If your Drizzle version doesn’t support column.eq(value) in where(), replace with:

```ts
import { eq } from 'drizzle-orm';
.where(eq(users.clerkUserId, clerkUserId))
```

## Acceptance

- Admin, VIP, and FREE users exist in DB.
- VIP has an ACTIVE membership with validTo in future.
- Safe to re-run without duplicates.
