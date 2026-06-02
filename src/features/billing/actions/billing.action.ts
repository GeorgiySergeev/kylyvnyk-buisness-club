'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

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
  | 'INVALID_INPUT'
  | 'NO_CUSTOMER'
  | 'NO_PAYMENT_METHOD'
  | 'NO_SUBSCRIPTION'
  | 'PORTAL_FAILED'
  | 'SETUP_INTENT_FAILED'
  | 'UNAUTHORIZED';

type BillingActionError = {
  code: BillingActionErrorCode;
  message: string;
};

type BillingActionResult<T> = { data: T; ok: true } | { error: BillingActionError; ok: false };

const paymentMethodIdSchema = z.object({
  paymentMethodId: z.string().trim().min(1),
});

const autoPaySchema = z.object({
  enabled: z.boolean(),
});

async function getLatestVipSubscription(userId: string) {
  return db.query.stripeSubscriptions.findFirst({
    where: (table, { and, eq }) => and(eq(table.userId, userId), eq(table.planCode, VIP_PLAN_CODE)),
    orderBy: (table, { desc }) => [desc(table.updatedAt)],
  });
}

async function getVipBillingContext(locale: SupportedLocale) {
  const user = await guardOnboarded(locale);

  if (!(await userHasActiveVipMembership(user.id))) {
    return {
      error: {
        code: 'UNAUTHORIZED' as const,
        message: 'VIP membership is required to access billing.',
      },
      ok: false as const,
    };
  }

  const subscription = await getLatestVipSubscription(user.id);

  if (!subscription) {
    return {
      error: {
        code: 'NO_SUBSCRIPTION' as const,
        message: 'No VIP subscription was found for this account.',
      },
      ok: false as const,
    };
  }

  if (!subscription.stripeCustomerId) {
    return {
      error: {
        code: 'NO_CUSTOMER' as const,
        message: 'No billing customer was found for this account.',
      },
      ok: false as const,
    };
  }

  return {
    data: {
      subscription,
      user,
    },
    ok: true as const,
  };
}

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
  const context = await getVipBillingContext(locale);

  if (!context.ok) {
    return context;
  }

  const { subscription, user } = context.data;

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
  const context = await getVipBillingContext(locale);

  if (!context.ok) {
    return context;
  }

  const { subscription } = context.data;
  const stripeCustomerId = subscription.stripeCustomerId!;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}${localizeHref(locale, '/m/dashboard?tab=subscription')}`,
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

export async function setSubscriptionAutoPayAction(
  locale: SupportedLocale,
  input: { enabled: boolean },
): Promise<BillingActionResult<{ cancelAtPeriodEnd: boolean }>> {
  const parsed = autoPaySchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: {
        code: 'INVALID_INPUT',
        message: 'Auto-pay preference is invalid.',
      },
      ok: false,
    };
  }

  const context = await getVipBillingContext(locale);

  if (!context.ok) {
    return context;
  }

  const { subscription, user } = context.data;

  try {
    const updated = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: !parsed.data.enabled,
    });

    const currentPeriodEnd = getSubscriptionPeriodEnd(updated) ?? subscription.currentPeriodEnd;

    await db
      .update(stripeSubscriptions)
      .set({
        cancelAtPeriodEnd: !parsed.data.enabled,
        currentPeriodEnd,
        status: updated.status,
        updatedAt: new Date(),
      })
      .where(eq(stripeSubscriptions.id, subscription.id));

    await db.insert(auditLogs).values({
      action: parsed.data.enabled ? 'MEMBERSHIP_AUTO_PAY_ENABLED' : 'MEMBERSHIP_AUTO_PAY_DISABLED',
      actorUserId: user.id,
      entityId: subscription.id,
      entityType: 'subscription',
      payload: {
        cancelAtPeriodEnd: !parsed.data.enabled,
        planCode: VIP_PLAN_CODE,
      },
    });

    return {
      data: {
        cancelAtPeriodEnd: !parsed.data.enabled,
      },
      ok: true,
    };
  } catch {
    return {
      error: {
        code: 'CHECKOUT_FAILED',
        message: 'Auto-pay preference could not be updated.',
      },
      ok: false,
    };
  }
}

export async function setDefaultPaymentMethodAction(
  locale: SupportedLocale,
  input: { paymentMethodId: string },
): Promise<BillingActionResult<{ paymentMethodId: string }>> {
  const parsed = paymentMethodIdSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: {
        code: 'INVALID_INPUT',
        message: 'Payment method is invalid.',
      },
      ok: false,
    };
  }

  const context = await getVipBillingContext(locale);

  if (!context.ok) {
    return context;
  }

  const { subscription, user } = context.data;

  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(parsed.data.paymentMethodId);
    const ownerCustomerId =
      typeof paymentMethod.customer === 'string' ? paymentMethod.customer : paymentMethod.customer?.id ?? null;

    if (paymentMethod.type !== 'card' || ownerCustomerId !== subscription.stripeCustomerId) {
      return {
        error: {
          code: 'NO_PAYMENT_METHOD',
          message: 'The selected payment method is not available for this account.',
        },
        ok: false,
      };
    }

    await Promise.all([
      stripe.customers.update(subscription.stripeCustomerId!, {
        invoice_settings: {
          default_payment_method: parsed.data.paymentMethodId,
        },
      }),
      stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        default_payment_method: parsed.data.paymentMethodId,
      }),
    ]);

    await db.insert(auditLogs).values({
      action: 'MEMBERSHIP_PAYMENT_METHOD_UPDATED',
      actorUserId: user.id,
      entityId: subscription.id,
      entityType: 'subscription',
      payload: {
        paymentMethodId: parsed.data.paymentMethodId,
        planCode: VIP_PLAN_CODE,
      },
    });

    return {
      data: {
        paymentMethodId: parsed.data.paymentMethodId,
      },
      ok: true,
    };
  } catch {
    return {
      error: {
        code: 'NO_PAYMENT_METHOD',
        message: 'The selected payment method could not be updated.',
      },
      ok: false,
    };
  }
}

export async function createBillingSetupIntentAction(
  locale: SupportedLocale,
): Promise<BillingActionResult<{ clientSecret: string }>> {
  const context = await getVipBillingContext(locale);

  if (!context.ok) {
    return context;
  }

  const { subscription } = context.data;

  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: subscription.stripeCustomerId!,
      metadata: {
        kclub_membership_type: VIP_PLAN_CODE,
        kclub_user_id: context.data.user.id,
      },
      payment_method_types: ['card'],
      usage: 'off_session',
    });

    if (!setupIntent.client_secret) {
      return {
        error: {
          code: 'SETUP_INTENT_FAILED',
          message: 'A setup session could not be created.',
        },
        ok: false,
      };
    }

    return {
      data: {
        clientSecret: setupIntent.client_secret,
      },
      ok: true,
    };
  } catch {
    return {
      error: {
        code: 'SETUP_INTENT_FAILED',
        message: 'A setup session could not be created.',
      },
      ok: false,
    };
  }
}

export async function finalizeBillingPaymentMethodAction(
  locale: SupportedLocale,
  input: { paymentMethodId: string },
): Promise<BillingActionResult<{ paymentMethodId: string }>> {
  return setDefaultPaymentMethodAction(locale, input);
}
