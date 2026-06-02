import 'server-only';

import Stripe from 'stripe';

import type { MembershipPlanCode } from '@/features/billing/lib/plan-codes';
import { VIP_PLAN_CODE } from '@/features/billing/lib/plan-codes';
import { env } from '@/lib/env';

export {
  BUSINESS_PLAN_CODE,
  FREE_PLAN_CODE,
  type MembershipPlanCode,
  type MembershipTierCode,
  type PaidMembershipPlanCode,
  VIP_PLAN_CODE,
} from '@/features/billing/lib/plan-codes';

export const STRIPE_API_VERSION = '2025-02-24.acacia' as const;

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: STRIPE_API_VERSION,
  typescript: true,
});

export function getStripePriceId(planCode: MembershipPlanCode): string {
  if (planCode === VIP_PLAN_CODE) {
    return env.STRIPE_PRICE_VIP_ANNUAL;
  }

  return env.STRIPE_PRICE_BUSINESS_ANNUAL;
}
