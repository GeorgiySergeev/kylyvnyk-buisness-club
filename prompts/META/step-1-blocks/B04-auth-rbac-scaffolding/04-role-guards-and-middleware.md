# 04-role-guards-and-middleware.md

## Title

Role guards — server-side access control for route groups

## Objective

Protect member, business, and admin routes using server-side guards. Provide simple helpers and demo usage in layouts.

## Steps

1) Create server-only guards: requireAuth, requireVipActive, requireAdmin.
2) Use guards in route-group layouts to block unauthorized access.
3) Keep Clerk middleware publicRoutes broad; rely on guards per layout for RBAC.

## Files to add

- src/features/auth/server/guards.ts
- src/app/(member)/layout.tsx (patch)
- src/app/(business)/layout.tsx (patch)
- src/app/(admin)/layout.tsx (patch)

### src/features/auth/server/guards.ts

```ts
import 'server-only';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithRole } from './roles';

export async function requireAuth(signInUrl = '/sign-in') {
  const { userId } = auth();
  if (!userId) redirect(signInUrl);
}

export async function requireVipActive(upgradeUrl = '/member/upgrade') {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const { role } = await getCurrentUserWithRole();
  if (role !== 'VIP' && role !== 'ADMIN') {
    redirect(upgradeUrl);
  }
}

export async function requireAdmin(deniedUrl = '/') {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const { role } = await getCurrentUserWithRole();
  if (role !== 'ADMIN') {
    redirect(deniedUrl);
  }
}
```

### src/app/(member)/layout.tsx

```tsx
import { ReactNode } from 'react';
import { requireAuth } from '@/features/auth/server/guards';

export default async function MemberLayout({ children }: { children: ReactNode }) {
  await requireAuth();
  return <main className="container py-8">{children}</main>;
}
```

### src/app/(business)/layout.tsx

```tsx
import { ReactNode } from 'react';
import { requireVipActive } from '@/features/auth/server/guards';

export default async function BusinessLayout({ children }: { children: ReactNode }) {
  await requireVipActive();
  return <main className="container py-8">{children}</main>;
}
```

### src/app/(admin)/layout.tsx

```tsx
import { ReactNode } from 'react';
import { requireAdmin } from '@/features/auth/server/guards';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return <main className="container py-8">{children}</main>;
}
```

## Acceptance

- Unauthenticated users visiting /member or /business are redirected to /sign-in.
- Non-VIP users visiting /business are redirected to /member/upgrade (placeholder).
- Non-admin users are blocked from /admin.
