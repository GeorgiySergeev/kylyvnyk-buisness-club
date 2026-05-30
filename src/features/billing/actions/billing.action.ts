'use server';

import { eq } from 'drizzle-orm';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { auditLogs, stripeSubscriptions } from '@/db/schema';
import { guardOnboarded } from '@/features/auth/lib/role-guards';
import { userHasActiveVipMembership } from '@/features/billing/lib/membership-lifecycle';
import { env } from '@/lib/env';
import {
  BUSINESS_PLAN_CODE,
  getStripePriceId,
  stripe,
  VIP_PLAN_CODE,
} from '@/lib/stripe/config';
import { getSubscriptionPeriodEnd } from '@/lib/stripe/subscription-period';

type BillingActionErrorCode =
  | 'ALREADY_VIP'
  | 'CHECKOUT_FAILED'
  | 'NO_CUSTOMER'
  | 'NO_SUBSCRIPTION'
  | 'PORTAL_FAILED'
  | 'UNAUTHORIZED';

type BillingActionError = {
  code: BillingActionErrorCode;
  message: string;
};

type BillingActionResult<T> = { data: T; ok: true } | { error: BillingActionError; ok: false };

export async function createVipCheckoutAction(
  locale: SupportedLocale,
): Promise<BillingActionResult<{ url: string }>> {
  const user = await guardOnboarded(locale);

  if (await userHasActiveVipMembership(user.id)) {
    return {
      error: {
        code: 'ALREADY_VIP',
        message: 'VIP membership is already active.',
      },
      ok: false,
    };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}${localizeHref(locale, '/m/checkout/cancel')}`,
      line_items: [
        {
          price: getStripePriceId(VIP_PLAN_CODE),
          quantity: 1,
        },
      ],
      metadata: {
        kclub_membership_type: VIP_PLAN_CODE,
        kclub_user_id: user.id,
      },
      mode: 'subscription',
      subscription_data: {
        metadata: {
          kclub_membership_type: VIP_PLAN_CODE,
          kclub_user_id: user.id,
        },
      },
      success_url: `${env.NEXT_PUBLIC_APP_URL}${localizeHref(locale, '/m/checkout/success')}?session_id={CHECKOUT_SESSION_ID}`,
    });

    if (!session.url) {
      return {
        error: {
          code: 'CHECKOUT_FAILED',
          message: 'Checkout session could not be created.',
        },
        ok: false,
      };
    }

    return {
      data: {
        url: session.url,
      },
      ok: true,
    };
  } catch {
    return {
      error: {
        code: 'CHECKOUT_FAILED',
        message: 'Checkout session could not be created.',
      },
      ok: false,
    };
  }
}

export async function createBusinessCheckoutAction(
  locale: SupportedLocale,
): Promise<BillingActionResult<{ url: string }>> {
  const user = await guardOnboarded(locale);

  if (!(await userHasActiveVipMembership(user.id))) {
    return {
      error: {
        code: 'UNAUTHORIZED',
        message: 'VIP membership is required before business placement checkout.',
      },
      ok: false,
    };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}${localizeHref(locale, '/m/checkout/cancel')}`,
      line_items: [
        {
          price: getStripePriceId(BUSINESS_PLAN_CODE),
          quantity: 1,
        },
      ],
      metadata: {
        kclub_membership_type: BUSINESS_PLAN_CODE,
        kclub_user_id: user.id,
      },
      mode: 'subscription',
      subscription_data: {
        metadata: {
          kclub_membership_type: BUSINESS_PLAN_CODE,
          kclub_user_id: user.id,
        },
      },
      success_url: `${env.NEXT_PUBLIC_APP_URL}${localizeHref(locale, '/m/checkout/success')}?session_id={CHECKOUT_SESSION_ID}`,
    });

    if (!session.url) {
      return {
        error: {
          code: 'CHECKOUT_FAILED',
          message: 'Checkout session could not be created.',
        },
        ok: false,
      };
    }

    return {
      data: {
        url: session.url,
      },
      ok: true,
    };
  } catch {
    return {
      error: {
        code: 'CHECKOUT_FAILED',
        message: 'Checkout session could not be created.',
      },
      ok: false,
    };
  }
}

export async function cancelVipMembershipAction(
  locale: SupportedLocale,
): Promise<BillingActionResult<{ cancelAtPeriodEnd: boolean }>> {
  const user = await guardOnboarded(locale);

  const subscription = await db.query.stripeSubscriptions.findFirst({
    where: (table, { and, eq }) => and(eq(table.userId, user.id), eq(table.planCode, VIP_PLAN_CODE)),
    orderBy: (table, { desc }) => [desc(table.updatedAt)],
  });

  if (!subscription) {
    return {
      error: {
        code: 'NO_SUBSCRIPTION',
        message: 'No VIP subscription was found for this account.',
      },
      ok: false,
    };
  }

  try {
    const updated = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    const currentPeriodEnd = getSubscriptionPeriodEnd(updated) ?? subscription.currentPeriodEnd;

    await db
      .update(stripeSubscriptions)
      .set({
        cancelAtPeriodEnd: true,
        currentPeriodEnd,
        status: updated.status,
        updatedAt: new Date(),
      })
      .where(eq(stripeSubscriptions.id, subscription.id));

    await db.insert(auditLogs).values({
      action: 'MEMBERSHIP_CANCELED',
      actorUserId: user.id,
      entityId: subscription.id,
      entityType: 'subscription',
      payload: {
        cancelAtPeriodEnd: true,
        planCode: VIP_PLAN_CODE,
      },
    });

    return {
      data: {
        cancelAtPeriodEnd: true,
      },
      ok: true,
    };
  } catch {
    return {
      error: {
        code: 'CHECKOUT_FAILED',
        message: 'VIP membership could not be canceled.',
      },
      ok: false,
    };
  }
}

export async function createBillingPortalSessionAction(
  locale: SupportedLocale,
): Promise<BillingActionResult<{ url: string }>> {
  const user = await guardOnboarded(locale);

  if (!(await userHasActiveVipMembership(user.id))) {
    return {
      error: {
        code: 'UNAUTHORIZED',
        message: 'VIP membership is required to access billing.',
      },
      ok: false,
    };
  }

  const subscription = await db.query.stripeSubscriptions.findFirst({
    where: (table, { and, eq }) => and(eq(table.userId, user.id), eq(table.planCode, VIP_PLAN_CODE)),
    orderBy: (table, { desc }) => [desc(table.updatedAt)],
  });

  const stripeCustomerId = subscription?.stripeCustomerId;
  if (!stripeCustomerId) {
    return {
      error: {
        code: 'NO_CUSTOMER',
        message: 'No billing customer was found for this account.',
      },
      ok: false,
    };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}${localizeHref(locale, '/m/dashboard?tab=settings')}`,
    });

    if (!session.url) {
      return {
        error: {
          code: 'PORTAL_FAILED',
          message: 'Billing portal session could not be created.',
        },
        ok: false,
      };
    }

    return {
      data: {
        url: session.url,
      },
      ok: true,
    };
  } catch {
    return {
      error: {
        code: 'PORTAL_FAILED',
        message: 'Billing portal session could not be created.',
      },
      ok: false,
    };
  }
}
