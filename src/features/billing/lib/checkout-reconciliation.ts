import type Stripe from 'stripe';

import {
  type MembershipPlanCode,
} from '@/features/billing/lib/plan-codes';

import { resolvePlanCodeFromMetadata } from './membership-plan';

export type CheckoutReconciliationInput = {
  planCode: MembershipPlanCode;
  subscriptionId: string;
};

export function resolveCheckoutReconciliationInput(
  session: Stripe.Checkout.Session,
  userId: string,
  vipPriceId: string,
  businessPriceId: string,
): CheckoutReconciliationInput | null {
  if (session.metadata?.kclub_user_id !== userId) {
    return null;
  }

  if (session.mode !== 'subscription' || session.payment_status !== 'paid') {
    return null;
  }

  if (!session.subscription) {
    return null;
  }

  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription.id;

  return {
    planCode: resolvePlanCodeFromMetadata(
      session.metadata,
      null,
      vipPriceId,
      businessPriceId,
    ),
    subscriptionId,
  };
}
