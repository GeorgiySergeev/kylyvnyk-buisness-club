# 06-cancel-vip-membership.md

## Title

Cancel VIP membership (self-serve) + UI hook

## Objective

Provide an authenticated endpoint that sets cancel_at_period_end=true in Stripe, updates DB, and returns remaining access period.

## Steps

1. Implement POST /api/stripe/cancel to update the Stripe subscription.
2. Update local DB row (subscriptions + memberships) accordingly.
3. Provide a simple client action/button snippet.

## Files to add

- src/app/api/stripe/cancel/route.ts
- src/components/member/cancel-vip-button.tsx

### src/app/api/stripe/cancel/route.ts

```ts
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { subscriptions } from '@/db/schema/stripe';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  // Find the user's active subscription
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });

  if (!sub?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'NO_SUBSCRIPTION' }, { status: 404 });
  }

  const updated = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  // Reflect locally; webhook will also update, but respond optimistically
  await db
    .update(subscriptions)
    .set({
      cancelAtPeriodEnd: true,
      currentPeriodEnd: updated.current_period_end
        ? new Date(updated.current_period_end * 1000)
        : sub.currentPeriodEnd,
      statusRaw: updated.status,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, sub.id));

  return NextResponse.json({
    ok: true,
    status: updated.status,
    currentPeriodEnd: updated.current_period_end
      ? new Date(updated.current_period_end * 1000)
      : null,
  });
}
```

### src/components/member/cancel-vip-button.tsx

```tsx
'use client';

import { useState } from 'react';

export function CancelVipButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onCancel() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/stripe/cancel', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Cancel failed');
      const until = data.currentPeriodEnd
        ? new Date(data.currentPeriodEnd).toLocaleString()
        : 'end of period';
      setMsg(`Cancellation scheduled. VIP remains active until ${until}.`);
    } catch (e: any) {
      setMsg(e.message || 'Cancel failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={onCancel}
        disabled={loading}
        className="px-5 py-3 rounded-md border border-border text-fg hover:bg-bgElev focus-gold disabled:opacity-60"
      >
        {loading ? 'Processing…' : 'Cancel VIP Membership'}
      </button>
      {msg && <p className="text-sm text-fgMuted">{msg}</p>}
    </div>
  );
}
```

## Acceptance

- POST /api/stripe/cancel sets cancel_at_period_end and updates local DB.
- Button triggers API and shows a confirmation message with end date.
- Webhook updates persist final state on subsequent events.

—
