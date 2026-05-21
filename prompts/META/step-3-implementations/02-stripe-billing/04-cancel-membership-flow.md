# step-3-implementations/02-stripe-billing/04-cancel-membership-flow.md

## Title

Cancel Membership (At Period End)

## Objective

Позволить пользователю отменить подписку, чтобы она не продлевалась в следующем периоде, но оставалась активной до конца оплаченного месяца.

## Files

### src/features/billing/server/actions.ts

```ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { desc, eq } from 'drizzle-orm';
import 'server-only';

import { subscriptions } from '@/db/schema/users';
import { logAudit } from '@/features/audit/server/log';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function cancelSubscriptionAtPeriodEnd() {
  const { userId } = auth();
  if (!userId) return { ok: false, error: 'UNAUTHORIZED' };

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  if (!sub || !sub.stripeSubscriptionId) {
    return { ok: false, error: 'NO_SUBSCRIPTION' };
  }

  try {
    const updated = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

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

    await logAudit({ action: 'CANCEL_SUBSCRIPTION', entity: 'user', entityId: userId });

    return { ok: true };
  } catch (error: any) {
    console.error('[STRIPE_CANCEL_ERROR]', error);
    return { ok: false, error: error.message };
  }
}
```

## Acceptance

- Stripe API вызывается с флагом `cancel_at_period_end: true`.
- База данных (`subscriptions`) обновляет флаг. Участник остается VIP до даты окончания.
