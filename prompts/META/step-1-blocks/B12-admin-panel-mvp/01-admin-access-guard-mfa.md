# 01-admin-access-guard-mfa.md

## Title

Admin Access — role ADMIN + MFA requirement

## Objective

Harden admin area access using requireAdminWithMfa guard. Provide an Admin layout with sidebar navigation and route skeletons.

## Steps

1) Create AdminNav for side navigation.
2) Ensure (admin) layout uses requireAdminWithMfa() and composes AdminNav.
3) Add skeleton pages for each admin section.

## Files to add/modify

- src/components/admin/admin-nav.tsx
- src/app/(admin)/layout.tsx (guard + layout)
- src/app/(admin)/page.tsx (dashboard)
- src/app/(admin)/users/page.tsx
- src/app/(admin)/businesses/page.tsx
- src/app/(admin)/categories/page.tsx
- src/app/(admin)/countries/page.tsx
- src/app/(admin)/subscriptions/page.tsx
- src/app/(admin)/introductions/page.tsx
- src/app/(admin)/logs/page.tsx

### src/components/admin/admin-nav.tsx

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const items = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/businesses', label: 'Businesses' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/countries', label: 'Countries' },
  { href: '/admin/subscriptions', label: 'Subscriptions' },
  { href: '/admin/introductions', label: 'Introductions' },
  { href: '/admin/logs', label: 'Audit Logs' },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <aside className="w-full md:w-60 shrink-0">
      <nav className="sticky top-16 space-y-1">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm border border-transparent hover:border-border',
                active ? 'bg-card text-gold-400 border-border' : 'text-fg'
              )}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

### src/app/(admin)/layout.tsx

```tsx
import { ReactNode } from 'react';
import { requireAdminWithMfa } from '@/features/auth/server/guards';
import { AdminNav } from '@/components/admin/admin-nav';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminWithMfa();
  return (
    <div className="container py-6">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <AdminNav />
        <main>{children}</main>
      </div>
    </div>
  );
}
```

### src/app/(admin)/page.tsx

```tsx
export default function AdminHome() {
  return (
    <section className="space-y-2">
      <h1 className="h2">Admin Dashboard</h1>
      <p className="body-sm text-fgMuted">Moderation and management tools.</p>
    </section>
  );
}
```

### Skeleton pages (create each)

```tsx
// src/app/(admin)/users/page.tsx
export default function AdminUsersPage() {
  return <section><h1 className="h2">Users</h1></section>;
}

// src/app/(admin)/businesses/page.tsx
export default function AdminBusinessesPage() {
  return <section><h1 className="h2">Businesses</h1></section>;
}

// src/app/(admin)/categories/page.tsx
export default function AdminCategoriesPage() {
  return <section><h1 className="h2">Categories</h1></section>;
}

// src/app/(admin)/countries/page.tsx
export default function AdminCountriesPage() {
  return <section><h1 className="h2">Countries</h1></section>;
}

// src/app/(admin)/subscriptions/page.tsx
export default function AdminSubscriptionsPage() {
  return <section><h1 className="h2">Subscriptions</h1></section>;
}

// src/app/(admin)/introductions/page.tsx
export default function AdminIntroductionsPage() {
  return <section><h1 className="h2">Introductions</h1></section>;
}

// src/app/(admin)/logs/page.tsx
export default function AdminLogsPage() {
  return <section><h1 className="h2">Audit Logs</h1></section>;
}
```

## Acceptance

- Visiting any /admin route requires ADMIN with MFA.
- Sidebar navigation highlights current page.
- Section skeletons render without errors.
