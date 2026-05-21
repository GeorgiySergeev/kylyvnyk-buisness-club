# 04-business-and-subscription-status.md

## Title

Status Panels — business profile publication + subscription state

## Objective

Provide simple, readable panels for:

- Current user’s business profile (status + basic info).
- Stripe subscription status (statusRaw, currentPeriodEnd, cancelAtPeriodEnd).

## Steps

1. Create BusinessStatusPanel.
2. Create SubscriptionStatusPanel.
3. Mount BusinessStatusPanel in /business (home), and SubscriptionStatusPanel in /member/subscription.

## Files to add/modify

- src/features/business/server/queries.ts
- src/features/business/business-status-panel.tsx
- src/features/membership/subscription-status-panel.tsx
- src/app/(business)/page.tsx (patch)
- src/app/(member)/subscription/page.tsx

### src/features/business/server/queries.ts

```ts
import { eq } from 'drizzle-orm';
import 'server-only';

import { businesses, categories } from '@/db/schema/catalog';
import { db } from '@/lib/db';

export async function getMyBusiness(userId: string) {
  const row = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      status: businesses.status,
      category: categories.name,
    })
    .from(businesses)
    .leftJoin(categories, eq(categories.id, businesses.categoryId))
    .where(eq(businesses.ownerUserId, userId))
    .limit(1);
  return row[0] ?? null;
}
```

### src/features/business/business-status-panel.tsx

```tsx
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

import { CardPremium } from '@/components/ui/card-premium';

import { getMyBusiness } from './server/queries';

export default async function BusinessStatusPanel() {
  const { userId } = auth();
  if (!userId) return null;

  const biz = await getMyBusiness(userId);
  if (!biz) {
    return (
      <CardPremium className="text-sm text-fgMuted">
        No business submitted yet.{' '}
        <Link href="/business/submit" className="underline hover:text-gold-400">
          Submit now
        </Link>
        .
      </CardPremium>
    );
  }

  return (
    <CardPremium className="space-y-1">
      <div className="text-sm text-fgMuted">Business</div>
      <div className="text-base font-semibold">{biz.name}</div>
      <div className="text-sm">Category: {biz.category ?? '—'}</div>
      <div className="text-sm">
        Status:{' '}
        {biz.status === 'UNDER_REVIEW'
          ? 'Under review'
          : biz.status === 'PUBLISHED'
            ? 'Published'
            : 'Hidden'}
      </div>
    </CardPremium>
  );
}
```

### src/features/membership/subscription-status-panel.tsx

```tsx
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

import { CancelVipButton } from '@/components/member/cancel-vip-button';
import { CardPremium } from '@/components/ui/card-premium';
import { subscriptions } from '@/db/schema/stripe';
import { db } from '@/lib/db';

export default async function SubscriptionStatusPanel() {
  const { userId } = auth();
  if (!userId) return null;

  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });

  if (!sub) {
    return (
      <CardPremium className="text-sm text-fgMuted">
        No active subscription. You can upgrade to VIP from the member home.
      </CardPremium>
    );
  }

  const end = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleString() : '—';

  return (
    <CardPremium className="space-y-3">
      <div className="text-sm text-fgMuted">Subscription</div>
      <div className="text-base">Status: {sub.statusRaw}</div>
      <div className="text-sm">Current period end: {end}</div>
      <div className="text-sm">Cancel at period end: {sub.cancelAtPeriodEnd ? 'Yes' : 'No'}</div>
      <div className="pt-2">
        <div className="flex gap-3">
          <form action="/api/stripe/portal" method="post">
            <button className="px-5 py-3 rounded-md border border-border hover:bg-bgElev focus-gold">
              Open Billing Portal
            </button>
          </form>
          <CancelVipButton />
        </div>
      </div>
    </CardPremium>
  );
}
```

### src/app/(business)/page.tsx (patch)

```tsx
import { Section } from '@/components/ui/section';
import { requireVipActive } from '@/features/auth/server/guards';
import BusinessStatusPanel from '@/features/business/business-status-panel';

export default async function BusinessHome() {
  await requireVipActive();
  return (
    <Section>
      <h1 className="h2">My Business</h1>
      <p className="mt-1 body-sm text-fgMuted">Status of your business profile.</p>
      <div className="mt-6">
        <BusinessStatusPanel />
      </div>
    </Section>
  );
}
```

### src/app/(member)/subscription/page.tsx

```tsx
import { Section } from '@/components/ui/section';
import SubscriptionStatusPanel from '@/features/membership/subscription-status-panel';

export default async function SubscriptionPage() {
  return (
    <Section>
      <h1 className="h2">Subscription</h1>
      <p className="mt-1 body-sm text-fgMuted">View or cancel your VIP membership.</p>
      <div className="mt-6">
        <SubscriptionStatusPanel />
      </div>
    </Section>
  );
}
```

## Acceptance

- /business shows business status or prompts to submit.
- /member/subscription shows Stripe status and actions.
- Buttons open Portal and allow cancellation.
