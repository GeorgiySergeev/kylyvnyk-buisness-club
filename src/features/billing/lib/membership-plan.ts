import type Stripe from 'stripe';

import {
  BUSINESS_PLAN_CODE,
  type MembershipPlanCode,
  VIP_PLAN_CODE,
} from '@/features/billing/lib/plan-codes';

export function resolvePlanCodeFromMetadata(
  metadata: Stripe.Metadata | null | undefined,
  priceId?: string | null,
  vipPriceId?: string,
  businessPriceId?: string,
): MembershipPlanCode {
  const membershipType = metadata?.kclub_membership_type;

  if (membershipType === VIP_PLAN_CODE || membershipType === BUSINESS_PLAN_CODE) {
    return membershipType;
  }

  if (priceId && businessPriceId && priceId === businessPriceId) {
    return BUSINESS_PLAN_CODE;
  }

  return VIP_PLAN_CODE;
}
