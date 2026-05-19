# 06-breadcrumbs-and-tabs.md

## Title

Breadcrumbs & Tabs — navigation primitives for dashboards

## Objective

Create accessible breadcrumbs and standardized tabs for Member/Business/Admin dashboards using shadcn Tabs.

## Steps

1) Add Breadcrumbs component with aria-label and separators.
2) Add Tabs wrapper with dark theme adjustments.
3) Provide simple examples for dashboard pages.

## Files to add

- src/components/navigation/breadcrumbs.tsx
- src/components/navigation/tabs.tsx

### src/components/navigation/breadcrumbs.tsx

```tsx
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

type Crumb = { label: string; href?: string };

export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-2 text-fgMuted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-gold-400">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast ? 'text-fg' : '')}>{item.label}</span>
              )}
              {!isLast && <span className="text-fgMuted">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

### src/components/navigation/tabs.tsx

```tsx
'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export { Tabs, TabsList, TabsTrigger, TabsContent };

// Usage example:
// <Tabs defaultValue="overview">
//   <TabsList>
//     <TabsTrigger value="overview">Overview</TabsTrigger>
//     <TabsTrigger value="settings">Settings</TabsTrigger>
//   </TabsList>
//   <TabsContent value="overview">...</TabsContent>
//   <TabsContent value="settings">...</TabsContent>
// </Tabs>
```

## Example usage (Member dashboard)

```tsx
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/navigation/tabs';

export default function MemberDashboard() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Member' }]} />
      <h1 className="h2">Member</h1>

      <Tabs defaultValue="card">
        <TabsList>
          <TabsTrigger value="card">Digital Card</TabsTrigger>
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>
        <TabsContent value="card">Card content…</TabsContent>
        <TabsContent value="catalog">Catalog content…</TabsContent>
        <TabsContent value="subscription">Subscription content…</TabsContent>
      </Tabs>
    </div>
  );
}
```

## Acceptance

- Breadcrumbs render with proper aria-label and separators.
- Tabs work with keyboard focus and selection visible on dark theme.
- Components are reusable across Member/Business/Admin sections.

—

Напиши “B08” — пришлю следующий блок (Landing: Hero, CTA, Stats, Top Partners, Recommendations) в .md формате по шагам.
