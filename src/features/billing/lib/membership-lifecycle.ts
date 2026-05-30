import 'server-only';

import { and, eq, isNull } from 'drizzle-orm';
import type Stripe from 'stripe';

import { db } from '@/db/client';
import { auditLogs, clubCards, memberships, stripeSubscriptions } from '@/db/schema';
import type { CardMemberType } from '@/db/schema/enums/card-status';
import { BUSINESS_PLAN_CODE, type MembershipPlanCode, VIP_PLAN_CODE } from '@/features/billing/lib/plan-codes';
import {
  getSubscriptionPeriodEnd,
  mapStripeSubscriptionStatus,
} from '@/lib/stripe/subscription-period';

import { resolvePlanCodeFromMetadata } from './membership-plan';

export type MembershipStatus = 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PAST_DUE';

export async function getActiveMembership(userId: string, planCode: MembershipPlanCode) {
  const rows = await db.query.memberships.findMany({
    where: and(
      eq(memberships.userId, userId),
      eq(memberships.planCode, planCode),
      isNull(memberships.deletedAt),
    ),
    orderBy: (table, { desc }) => [desc(table.updatedAt)],
    limit: 1,
  });

  const membership = rows[0];

  if (!membership || membership.status !== 'ACTIVE') {
    return null;
  }

  if (membership.endsAt && membership.endsAt.getTime() < Date.now()) {
    return null;
  }

  return membership;
}

export async function userHasActiveVipMembership(userId: string): Promise<boolean> {
  return Boolean(await getActiveMembership(userId, VIP_PLAN_CODE));
}

async function upsertMembershipRow(input: {
  endsAt: Date | null;
  planCode: MembershipPlanCode;
  startsAt: Date;
  status: MembershipStatus;
  stripeEventId: string;
  userId: string;
}) {
  const existing = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.userId, input.userId),
      eq(memberships.planCode, input.planCode),
      isNull(memberships.deletedAt),
    ),
  });

  const now = new Date();

  if (existing) {
    const [updated] = await db
      .update(memberships)
      .set({
        endsAt: input.endsAt,
        startsAt: input.startsAt,
        status: input.status,
        updatedAt: now,
      })
      .where(eq(memberships.id, existing.id))
      .returning();

    await db.insert(auditLogs).values({
      action: `MEMBERSHIP_${input.status}`,
      actorUserId: input.userId,
      entityId: existing.id,
      entityType: 'membership',
      payload: {
        fromStatus: existing.status,
        periodEnd: input.endsAt?.toISOString() ?? null,
        planCode: input.planCode,
        stripeEventId: input.stripeEventId,
        toStatus: input.status,
      },
    });

    return updated ?? existing;
  }

  const [created] = await db
    .insert(memberships)
    .values({
      endsAt: input.endsAt,
      planCode: input.planCode,
      startsAt: input.startsAt,
      status: input.status,
      userId: input.userId,
    })
    .returning();

  if (created) {
    await db.insert(auditLogs).values({
      action: `MEMBERSHIP_${input.status}`,
      actorUserId: input.userId,
      entityId: created.id,
      entityType: 'membership',
      payload: {
        planCode: input.planCode,
        stripeEventId: input.stripeEventId,
        toStatus: input.status,
      },
    });
  }

  return created;
}

async function syncClubCardMemberType(userId: string, memberType: CardMemberType, expiresAt: Date | null) {
  const card = await db.query.clubCards.findFirst({
    where: eq(clubCards.userId, userId),
  });

  if (!card) {
    return;
  }

  await db
    .update(clubCards)
    .set({
      expiresAt,
      memberType,
      updatedAt: new Date(),
    })
    .where(eq(clubCards.id, card.id));
}

async function upsertStripeSubscriptionRow(input: {
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
  planCode: MembershipPlanCode;
  status: string;
  stripeCustomerId: string | null;
  stripePriceId: string | null;
  stripeSubscriptionId: string;
  userId: string;
}) {
  const existing = await db.query.stripeSubscriptions.findFirst({
    where: eq(stripeSubscriptions.stripeSubscriptionId, input.stripeSubscriptionId),
  });

  const now = new Date();
  const values = {
    cancelAtPeriodEnd: input.cancelAtPeriodEnd,
    currentPeriodEnd: input.currentPeriodEnd,
    planCode: input.planCode,
    status: input.status,
    stripeCustomerId: input.stripeCustomerId,
    stripePriceId: input.stripePriceId,
    updatedAt: now,
    userId: input.userId,
  };

  if (existing) {
    await db.update(stripeSubscriptions).set(values).where(eq(stripeSubscriptions.id, existing.id));
    return;
  }

  await db.insert(stripeSubscriptions).values({
    ...values,
    stripeSubscriptionId: input.stripeSubscriptionId,
  });
}

export async function applySubscriptionState(input: {
  planCode: MembershipPlanCode;
  stripeEventId: string;
  subscription: Stripe.Subscription;
  userId: string;
}) {
  const mappedStatus = mapStripeSubscriptionStatus(input.subscription.status);
  const periodEnd = getSubscriptionPeriodEnd(input.subscription);
  const priceId = input.subscription.items.data[0]?.price.id ?? null;

  await upsertStripeSubscriptionRow({
    cancelAtPeriodEnd: input.subscription.cancel_at_period_end,
    currentPeriodEnd: periodEnd,
    planCode: input.planCode,
    status: input.subscription.status,
    stripeCustomerId:
      typeof input.subscription.customer === 'string'
        ? input.subscription.customer
        : input.subscription.customer?.id ?? null,
    stripePriceId: priceId,
    stripeSubscriptionId: input.subscription.id,
    userId: input.userId,
  });

  await upsertMembershipRow({
    endsAt: periodEnd,
    planCode: input.planCode,
    startsAt: new Date(),
    status: mappedStatus,
    stripeEventId: input.stripeEventId,
    userId: input.userId,
  });

  if (input.planCode === VIP_PLAN_CODE) {
    if (mappedStatus === 'ACTIVE') {
      await syncClubCardMemberType(input.userId, 'VIP', periodEnd);
      return;
    }

    await syncClubCardMemberType(input.userId, 'FREE', null);
  }

  if (input.planCode === BUSINESS_PLAN_CODE && mappedStatus !== 'ACTIVE') {
    await db
      .update(memberships)
      .set({ status: 'EXPIRED', updatedAt: new Date() })
      .where(
        and(
          eq(memberships.userId, input.userId),
          eq(memberships.planCode, BUSINESS_PLAN_CODE),
          isNull(memberships.deletedAt),
        ),
      );
  }
}

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  stripeEventId: string,
  retrieveSubscription: (subscriptionId: string) => Promise<Stripe.Subscription>,
  vipPriceId: string,
  businessPriceId: string,
) {
  const userId = session.metadata?.kclub_user_id;

  if (!userId || !session.subscription) {
    return;
  }

  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
  const subscription = await retrieveSubscription(subscriptionId);
  const planCode = resolvePlanCodeFromMetadata(
    session.metadata,
    subscription.items.data[0]?.price.id ?? null,
    vipPriceId,
    businessPriceId,
  );

  await applySubscriptionState({
    planCode,
    stripeEventId,
    subscription,
    userId,
  });
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  stripeEventId: string,
  vipPriceId: string,
  businessPriceId: string,
) {
  const userId = subscription.metadata?.kclub_user_id;

  if (!userId) {
    const existing = await db.query.stripeSubscriptions.findFirst({
      where: eq(stripeSubscriptions.stripeSubscriptionId, subscription.id),
    });

    if (!existing?.userId) {
      return;
    }

    await applySubscriptionState({
      planCode: resolvePlanCodeFromMetadata(
        subscription.metadata,
        subscription.items.data[0]?.price.id ?? null,
        vipPriceId,
        businessPriceId,
      ),
      stripeEventId,
      subscription,
      userId: existing.userId,
    });
    return;
  }

  await applySubscriptionState({
    planCode: resolvePlanCodeFromMetadata(
      subscription.metadata,
      subscription.items.data[0]?.price.id ?? null,
      vipPriceId,
      businessPriceId,
    ),
    stripeEventId,
    subscription,
    userId,
  });
}
