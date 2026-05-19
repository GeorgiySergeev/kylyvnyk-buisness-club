# 06-activity-log-minimal.md

## Title

Activity Log — minimal recent actions for the current user

## Objective

Show a minimal list of recent actions (last 20) performed by the current user for transparency and support.

## Steps

1) Add server query to fetch last 20 audit logs by actor_user_id.
2) Render a simple list with action, entity, timestamp.
3) Link from Member dashboard.

## Files to add

- src/features/audit/server/my-logs.ts
- src/app/(member)/activity/page.tsx
- src/app/(member)/page.tsx (add link to Activity)

### src/features/audit/server/my-logs.ts

```ts
import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { auditLogs } from '@/db/schema/audit';
import { desc, eq } from 'drizzle-orm';

export async function getMyRecentLogs() {
  const { userId } = auth();
  if (!userId) return [];
  const rows = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.actorUserId, userId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(20);
  return rows;
}
```

### src/app/(member)/activity/page.tsx

```tsx
import { Section } from '@/components/ui/section';
import { getMyRecentLogs } from '@/features/audit/server/my-logs';

export default async function ActivityPage() {
  const rows = await getMyRecentLogs();

  return (
    <Section>
      <h1 className="h2">Activity</h1>
      <p className="mt-1 body-sm text-fgMuted">Recent actions in your account.</p>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-lg border border-border bg-card p-6 text-sm text-fgMuted">
          No recent activity.
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border rounded-lg border border-border bg-card">
          {rows.map((r) => (
            <div key={r.id} className="p-4 text-sm">
              <div className="font-medium">{r.action}</div>
              <div className="text-fgMuted">
                {r.entity} · {new Date(r.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
```

### src/app/(member)/page.tsx (append Activity link in Actions)

```tsx
// ...existing imports and code
// Inside the Actions section, add:
<div className="mt-2">
  <a href="/member/activity" className="underline hover:text-gold-400 text-sm">View Activity</a>
</div>
```

## Acceptance

- /member/activity lists last 20 actions or shows “No recent activity.”
- Business submit and Introduction submit actions appear when performed.
- No sensitive payloads are displayed; minimal metadata only.

—

Готов продолжить с B12 — Admin Panel MVP. Напиши “B12”, и пришлю следующий набор .md промтов по шагам.
