# 01-auth-clerk/02-auth-pages-guards-middleware.md

## Title

Auth Pages, Middleware, and Roles

## Objective

Настроить роутинг Clerk (pages) и защиту маршрутов. Внедрить Role‑Based Access Control.

## Files

### src/middleware.ts

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/stripe/webhook',
  '/verify-card(.*)',
  '/catalog(.*)',
]);

export default clerkMiddleware((auth, req) => {
  const url = new URL(req.url);

  // Canonicalize slash
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated from sign-in/up
  if (
    auth().userId &&
    (url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### src/features/auth/server/guards.ts

```ts
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import 'server-only';

import { memberships } from '@/db/schema/users';
import { db } from '@/lib/db';

export async function requireAuth() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');
  return userId;
}

export async function getUserTier(userId: string) {
  const [membership] = await db
    .select({ tier: memberships.tier, status: memberships.status })
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .limit(1);
  return membership;
}

export async function requireVipActive() {
  const userId = await requireAuth();
  const membership = await getUserTier(userId);
  if (
    !membership ||
    membership.status !== 'ACTIVE' ||
    (membership.tier !== 'VIP' && membership.tier !== 'ADMIN')
  ) {
    redirect('/upgrade');
  }
  return userId;
}
```

## Acceptance

- Мидлвар корректно редиректит и блокирует приватные пути.
- Функция `requireVipActive` проверяет статус `ACTIVE` и уровень `VIP`/`ADMIN` в БД.
