# 01-route-groups-structure.md

## Title

Route Groups Structure — public, auth, member, business, admin

## Objective

Create and standardize App Router groups for public pages, auth, member/VIP, business tools, and admin. Ensure each group has its own layout shell.

## Steps

1) Create/verify route groups: (public), (auth), (member), (business), (admin).
2) Add minimal layout shells per group to prepare for navigation and guards.
3) Add placeholder pages to confirm routing works.

## Files to add/modify

- src/app/(public)/layout.tsx
- src/app/(public)/page.tsx
- src/app/(auth)/layout.tsx
- src/app/(auth)/page.tsx
- src/app/(member)/layout.tsx
- src/app/(member)/page.tsx
- src/app/(business)/layout.tsx
- src/app/(business)/page.tsx
- src/app/(admin)/layout.tsx
- src/app/(admin)/page.tsx

### src/app/(public)/layout.tsx

```tsx
import { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
    </>
  );
}
```

### src/app/(public)/page.tsx

```tsx
export default function LandingPage() {
  return (
    <section className="container py-12">
      <h1 className="h1">KYLYVNYK CLUB</h1>
      <p className="mt-2 body-lg">International private membership platform</p>
    </section>
  );
}
```

### src/app/(auth)/layout.tsx

```tsx
import { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/site-header';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader compact />
      <main className="container py-10">{children}</main>
    </>
  );
}
```

### src/app/(auth)/page.tsx

```tsx
export default function AuthIndexPage() {
  return (
    <section>
      <h1 className="h2">Authentication</h1>
      <p className="body-sm text-fgMuted mt-2">Choose sign in or sign up.</p>
    </section>
  );
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

### src/app/(member)/page.tsx

```tsx
export default function MemberHome() {
  return (
    <section>
      <h1 className="h2">Member Dashboard</h1>
      <p className="mt-2 body-sm text-fgMuted">Your digital card and catalog access.</p>
    </section>
  );
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

### src/app/(business)/page.tsx

```tsx
export default function BusinessHome() {
  return (
    <section>
      <h1 className="h2">Business Tools</h1>
      <p className="mt-2 body-sm text-fgMuted">Submit and manage your business profile.</p>
    </section>
  );
}
```

### src/app/(admin)/layout.tsx

```tsx
import { ReactNode } from 'react';
import { requireAdminWithMfa } from '@/features/auth/server/guards';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminWithMfa();
  return <main className="container py-8">{children}</main>;
}
```

### src/app/(admin)/page.tsx

```tsx
export default function AdminHome() {
  return (
    <section>
      <h1 className="h2">Admin Panel</h1>
      <p className="mt-2 body-sm text-fgMuted">Moderation and management tools.</p>
    </section>
  );
}
```

## Acceptance

- Each route group renders and composes its own layout.
- Public pages show header+footer; dashboards are minimal shells with guards.
- next dev → navigation across groups works without errors.
