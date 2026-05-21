# Skill: Clerk v6 in Codex sessions

## The #1 gotcha — async auth()

```ts
// ✅ ALWAYS
const { userId } = await auth();
const { userId, sessionId } = await auth();

// ❌ NEVER — returns Promise, destructuring gives undefined
const { userId } = auth();
```

Every time you write `auth()` — add `await` before even thinking.

## Canonical current-user helper

```ts
// src/features/auth/lib/get-user-by-clerk-id.ts
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import 'server-only';

import { db } from '@/db/client';
import { users } from '@/db/schema';

export async function getCurrentUserOrThrow() {
  const { userId } = await auth(); // ← await
  if (!userId) throw new Error('UNAUTHENTICATED');
  const row = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });
  if (!row) throw new Error('USER_NOT_PROVISIONED');
  return row;
}

export async function getCurrentUser() {
  try {
    return await getCurrentUserOrThrow();
  } catch {
    return null;
  }
}
```

Never duplicate this pattern. Import from the canonical file.

## Role check pattern

```ts
// ✅ — roles from OUR DB
const user = await getCurrentUserOrThrow();
if (user.role !== 'ADMIN') throw new Error('FORBIDDEN');

// ❌ — never from Clerk metadata
const { sessionClaims } = await auth();
sessionClaims?.publicMetadata?.role; // can drift from DB
```

## Webhook handler

```ts
// Clerk user.created → create users row in our DB
// Clerk user.updated → update displayName, email
// Clerk user.deleted → soft-delete: set users.deleted_at = now()
// Path: app/api/clerk/webhook/route.ts
// Signature check: svix library
```

## Middleware — protect routes

```ts
// src/middleware.ts
const isProtectedRoute = createRouteMatcher([
  '/:locale/m(.*)', // member area
  '/:locale/b(.*)', // business area
  '/:locale/admin(.*)', // admin panel
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); // ← async + await
  }
  return intlMiddleware(req);
});
```

## Clerk appearance (dark theme)

```ts
// src/lib/auth/clerk-appearance.ts
// Already created in B02. Import from there.
// Never inline appearance config in components.
import { clerkAppearance } from "@/lib/auth/clerk-appearance";
<ClerkProvider appearance={clerkAppearance}>
```
