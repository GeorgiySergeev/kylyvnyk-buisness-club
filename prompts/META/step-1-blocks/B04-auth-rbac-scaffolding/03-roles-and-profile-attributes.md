# 03-roles-and-profile-attributes.md

## Title

Roles and profile attributes — DB sync and role resolution

## Objective

On first authenticated request, ensure a local users row exists, sync basic profile fields, and resolve role: ADMIN | VIP | FREE.

## Steps

1) Create user sync utility that upserts users by clerkUserId.
2) Resolve role via DB:
   - ADMIN: users.isAdmin = true
   - VIP: active membership of type 'VIP' (status ACTIVE, valid_to future or null)
   - FREE: otherwise
3) Expose getCurrentUserWithRole() for server usage.

## Files to add

- src/features/auth/server/user-sync.ts
- src/features/auth/server/roles.ts

### src/features/auth/server/user-sync.ts

```ts
import 'server-only';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema/user';
import { eq } from 'drizzle-orm';

export async function ensureUserSynced() {
  const cu = await currentUser();
  if (!cu) return null;

  const email = cu.emailAddresses?.[0]?.emailAddress ?? null;

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkUserId, cu.id),
  });

  if (existing) return existing;

  const inserted = await db
    .insert(users)
    .values({
      clerkUserId: cu.id,
      email: email ?? `${cu.id}@placeholder.local`,
      isAdmin: false,
      status: 'ACTIVE' as any,
    })
    .returning();

  return inserted[0] ?? null;
}
```

### src/features/auth/server/roles.ts

```ts
import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema/user';
import { memberships } from '@/db/schema/membership';
import { eq, and, gte, or, isNull } from 'drizzle-orm';
import { ensureUserSynced } from './user-sync';

export type AppRole = 'ADMIN' | 'VIP' | 'FREE';

export async function getCurrentUserWithRole() {
  const { userId } = auth();
  if (!userId) return { role: 'FREE' as AppRole, user: null };

  // Ensure DB user exists
  const user = await ensureUserSynced();

  if (!user) return { role: 'FREE' as AppRole, user: null };

  if (user.isAdmin) return { role: 'ADMIN' as AppRole, user };

  const now = new Date();
  const mem = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.userId, user.id),
      eq(memberships.type, 'VIP' as any),
      eq(memberships.status, 'ACTIVE' as any),
      or(isNull(memberships.validTo), gte(memberships.validTo, now))
    ),
  });

  if (mem) return { role: 'VIP' as AppRole, user };
  return { role: 'FREE' as AppRole, user };
}
```

## Acceptance

- First signed-in visit creates a users row with clerkUserId/email.
- getCurrentUserWithRole() returns ADMIN/VIP/FREE correctly based on DB.
- No duplicate users for the same Clerk user.
