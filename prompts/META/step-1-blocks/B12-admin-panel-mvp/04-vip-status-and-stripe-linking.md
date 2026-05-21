# 04-vip-status-and-stripe-linking.md

## Title

VIP Status Management — visibility + manual override + Stripe linking helper

## Objective

Provide admin with:

- Read-only view of a user’s current subscription/membership.
- Manual override to create/update Membership (VIP with valid_to).
- Helper to find Stripe customer by email and open customer portal (for support).

Note: Stripe remains source of truth. Manual override is for support-only.

## Steps

1. Add user details page with membership/subscription panels.
2. Add server action to upsert a VIP membership with valid_to.
3. Provide helper link to Stripe (if subscription row exists).

## Files to add/modify

- src/app/(admin)/users/[id]/page.tsx
- src/features/admin/server/membership-actions.ts

### src/features/admin/server/membership-actions.ts

```ts
'use server';

import { eq } from 'drizzle-orm';
import 'server-only';

import { memberships } from '@/db/schema/membership';
import { logAudit } from '@/features/audit/server/log';
import { revalidateVerifyCardByUserId } from '@/features/membership/server/revalidate';
import { db } from '@/lib/db';

export async function upsertVipMembership(userId: string, validToIso?: string) {
  const validTo = validToIso ? new Date(validToIso) : null;

  // Upsert VIP membership row; ACTIVE if not expired, else CANCELED
  const status =
    validTo && validTo.getTime() < Date.now() ? ('CANCELED' as any) : ('ACTIVE' as any);

  await db
    .insert(memberships)
    .values({
      userId,
      type: 'VIP' as any,
      status,
      validTo,
    })
    .onConflictDoUpdate({
      target: [memberships.userId, memberships.type, memberships.status],
      set: { validTo },
    });

  await logAudit({
    action: 'ADMIN_VIP_UPSERT',
    entity: 'membership',
    entityId: userId,
    meta: { validToIso },
  });
  await revalidateVerifyCardByUserId(userId);
}
```

### src/app/(admin)/users/[id]/page.tsx

```tsx
import { desc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { Section } from '@/components/ui/section';
import { memberships } from '@/db/schema/membership';
import { subscriptions } from '@/db/schema/stripe';
import { users } from '@/db/schema/user';
import { upsertVipMembership } from '@/features/admin/server/membership-actions';
import { db } from '@/lib/db';

async function getUserView(id: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) return null;

  const vip = await db.query.memberships.findFirst({
    where: eq(memberships.userId, id),
    orderBy: [desc(memberships.updatedAt)],
  });

  const sub = await db.query.subscriptions.findFirst({ where: eq(subscriptions.userId, id) });

  return { user, vip, sub };
}

export default async function AdminUserDetails({ params }: { params: { id: string } }) {
  const view = await getUserView(params.id);
  if (!view) notFound();

  const stripeDash = view.sub?.stripeCustomerId
    ? `https://dashboard.stripe.com/customers/${view.sub.stripeCustomerId}`
    : null;

  async function action(formData: FormData) {
    'use server';
    const validTo = String(formData.get('validTo') || '');
    await upsertVipMembership(params.id, validTo || undefined);
  }

  return (
    <Section>
      <h1 className="h2">User</h1>
      <div className="mt-4 rounded-lg border border-border bg-card p-4 space-y-2">
        <div className="text-sm">
          <span className="text-fgMuted">Email:</span> {view.user.email}
        </div>
        <div className="text-sm">
          <span className="text-fgMuted">Status:</span> {String(view.user.status)}
        </div>
        <div className="text-sm">
          <span className="text-fgMuted">Admin:</span> {view.user.isAdmin ? 'Yes' : 'No'}
        </div>
      </div>

      <h2 className="h3 mt-6">Membership</h2>
      <div className="mt-2 rounded-lg border border-border bg-card p-4 space-y-2">
        <div className="text-sm">Type: {view.vip?.type ?? '—'}</div>
        <div className="text-sm">Status: {view.vip?.status ?? '—'}</div>
        <div className="text-sm">
          Valid to: {view.vip?.validTo ? new Date(view.vip.validTo).toLocaleString() : '—'}
        </div>

        <form action={action} className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm font-medium" htmlFor="validTo">
              Set VIP valid_to (ISO, optional)
            </label>
            <input
              id="validTo"
              name="validTo"
              placeholder="2026-12-31T23:59:59Z"
              className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold"
            />
          </div>
          <button className="px-5 py-3 rounded-md border border-border hover:bg-bgElev focus-gold">
            Upsert VIP Membership
          </button>
        </form>

        <p className="mt-2 text-xs text-fgMuted">
          Manual override is for support only. Stripe remains the source of truth for billing.
        </p>
      </div>

      <h2 className="h3 mt-6">Stripe</h2>
      <div className="mt-2 rounded-lg border border-border bg-card p-4 space-y-2">
        <div className="text-sm">Subscription: {view.sub?.stripeSubscriptionId ?? '—'}</div>
        <div className="text-sm">Status: {view.sub?.statusRaw ?? '—'}</div>
        <div className="text-sm">
          Current period end:{' '}
          {view.sub?.currentPeriodEnd ? new Date(view.sub.currentPeriodEnd).toLocaleString() : '—'}
        </div>
        <div className="text-sm">
          Cancel at period end: {view.sub?.cancelAtPeriodEnd ? 'Yes' : 'No'}
        </div>
        {stripeDash && (
          <a
            className="inline-block mt-2 px-4 py-2 rounded-md border border-border hover:bg-bgElev focus-gold text-sm"
            href={stripeDash}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Stripe Dashboard
          </a>
        )}
      </div>
    </Section>
  );
}
```

## Acceptance

- Admin user details show membership/subscription info.
- Upserting VIP membership sets/updates valid_to and revalidates verify-card.
- Stripe customer link opens Stripe Dashboard if available.
