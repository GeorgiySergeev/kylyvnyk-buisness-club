# 02-vip-dashboard-and-bi-entry.md

## Title

VIP Dashboard — VIP access overview + Business Introduction entry point

## Objective

Create a VIP dashboard page with:

- VIP access confirmation and benefits.
- Entry to “Business Introduction” request (VIP‑only).
- Links to Business tools and Subscription.

## Steps

1. Add VIP dashboard route guarded by requireVipActive().
2. Display VIP status + actions.
3. Add “Request Business Introduction” entry page with minimal form.

## Files to add

- src/app/(member)/vip/page.tsx
- src/app/(member)/vip/introduction/page.tsx
- src/features/introductions/server/actions.ts

### src/app/(member)/vip/page.tsx

```tsx
import Link from 'next/link';

import { Section } from '@/components/ui/section';
import { requireVipActive } from '@/features/auth/server/guards';
import MemberCardPanel from '@/features/membership/member-card-panel';

export default async function VipDashboardPage() {
  await requireVipActive();

  return (
    <Section>
      <h1 className="h2">VIP Dashboard</h1>
      <p className="mt-1 body-sm text-fgMuted">
        VIP members get access to Business Introductions and can submit one business profile.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="h3 mb-3">Your VIP Card</h2>
          <MemberCardPanel />
        </div>

        <div>
          <h2 className="h3 mb-3">VIP Actions</h2>
          <div className="space-y-2">
            <Link href="/member/vip/introduction" className="underline hover:text-gold-400">
              Request Business Introduction
            </Link>
            <div>
              <Link href="/business" className="underline hover:text-gold-400">
                Open Business Tools
              </Link>
            </div>
            <div>
              <Link href="/member/subscription" className="underline hover:text-gold-400">
                Manage Subscription
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
```

### src/features/introductions/server/actions.ts

```ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import 'server-only';
import { z } from 'zod';

import { businesses } from '@/db/schema/catalog';
import { introductions } from '@/db/schema/membership';
import { logAudit } from '@/features/audit/server/log';
import { requireVipActive } from '@/features/auth/server/guards';
import { db } from '@/lib/db';

const schema = z.object({
  businessId: z.string().uuid(),
  note: z.string().max(500).optional(),
});

export async function submitIntroduction(formData: FormData) {
  await requireVipActive();
  const { userId } = auth();
  if (!userId) return { ok: false, error: 'UNAUTHORIZED' };

  const input = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse({
    businessId: input.businessId,
    note: input.note,
  });
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten() };

  // Validate business exists and is PUBLISHED
  const biz = await db.query.businesses.findFirst({
    where: eq(businesses.id, parsed.data.businessId),
    columns: { id: true, status: true },
  });
  if (!biz || (biz.status as any) !== 'PUBLISHED') {
    return { ok: false, error: 'INVALID_BUSINESS' };
  }

  const [row] = await db
    .insert(introductions)
    .values({
      createdByUserId: userId,
      targetBusinessId: parsed.data.businessId,
      status: 'SUBMITTED' as any,
      internalNotes: parsed.data.note ?? null,
    })
    .returning();

  await logAudit({
    action: 'INTRODUCTION_SUBMIT',
    entity: 'introduction',
    entityId: row.id,
    meta: { targetBusinessId: parsed.data.businessId },
  });

  return { ok: true };
}
```

### src/app/(member)/vip/introduction/page.tsx

```tsx
import { Section } from '@/components/ui/section';
import { requireVipActive } from '@/features/auth/server/guards';
import { submitIntroduction } from '@/features/introductions/server/actions';
import { getPublishedBusinessOptions } from '@/features/introductions/server/select-options';

export default async function IntroductionPage() {
  await requireVipActive();
  const options = await getPublishedBusinessOptions();

  return (
    <Section>
      <h1 className="h2">Request Business Introduction</h1>
      <p className="mt-1 body-sm text-fgMuted">
        Introductions are processed by the club team. No commissions, bonuses, or MLM mechanics.
      </p>

      <form action={submitIntroduction} className="mt-6 max-w-lg space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="businessId" className="text-sm font-medium">
            Target Partner
          </label>
          <select
            id="businessId"
            name="businessId"
            className="min-h-11 w-full rounded-md border border-border bg-card px-3 py-2 focus-gold"
            required
          >
            <option value="">Select partner…</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="note" className="text-sm font-medium">
            Note (optional)
          </label>
          <textarea
            id="note"
            name="note"
            maxLength={500}
            className="min-h-24 w-full rounded-md border border-border bg-card px-3 py-2 focus-gold"
            placeholder="Context or goals for this introduction (max 500 chars)"
          />
        </div>

        <button className="gold-gradient text-fgOnGold rounded-md px-6 py-3 shadow-cta focus-gold">
          Submit request
        </button>
      </form>

      <p className="mt-4 text-xs text-fgMuted">
        Limits and approvals are managed by admins. No public limits or leaderboards are shown.
      </p>
    </Section>
  );
}
```

### src/features/introductions/server/select-options.ts

```ts
import { eq } from 'drizzle-orm';
import 'server-only';

import { businesses } from '@/db/schema/catalog';
import { db } from '@/lib/db';

export async function getPublishedBusinessOptions() {
  const rows = await db
    .select({ id: businesses.id, name: businesses.name })
    .from(businesses)
    .where(eq(businesses.status, 'PUBLISHED' as any))
    .limit(200);
  return rows;
}
```

### src/features/audit/server/log.ts

```ts
'use server';

import { auth } from '@clerk/nextjs/server';
import 'server-only';

import { auditLogs } from '@/db/schema/audit';
import { db } from '@/lib/db';

export async function logAudit({
  action,
  entity,
  entityId,
  meta,
}: {
  action: string;
  entity: string;
  entityId: string;
  meta?: Record<string, any>;
}) {
  const { userId } = auth();
  await db.insert(auditLogs).values({
    actorUserId: userId ?? null,
    action,
    entity,
    entityId,
    meta: (meta as any) ?? null,
    createdAt: new Date(),
  });
}
```

## Acceptance

- /member/vip is accessible only to VIP; shows card and links.
- Introduction form lists only PUBLISHED partners; submission creates a SUBMITTED row and an audit log.
- No mention of commissions/MLM; complies with legal language.
