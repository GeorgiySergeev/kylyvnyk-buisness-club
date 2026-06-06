import { describe, expect, it } from 'vitest';
import type Stripe from 'stripe';

import { resolveCheckoutReconciliationInput } from '../../../src/features/billing/lib/checkout-reconciliation';
import { resolvePlanCodeFromMetadata } from '../../../src/features/billing/lib/membership-plan';
import {
  hasMembershipTransitionChanged,
  resolveEffectiveMembership,
} from '../../../src/features/billing/lib/membership-resolver';
import {
  BUSINESS_PLAN_CODE,
  FREE_PLAN_CODE,
  VIP_PLAN_CODE,
} from '../../../src/features/billing/lib/plan-codes';
import {
  getSubscriptionPeriodEnd,
  getSubscriptionPeriodStart,
  mapStripeSubscriptionStatus,
} from '../../../src/lib/stripe/subscription-period';

describe('billing reconciliation logic', () => {
  it('maps Stripe statuses to internal membership statuses', () => {
    expect(mapStripeSubscriptionStatus('active')).toBe('ACTIVE');
    expect(mapStripeSubscriptionStatus('trialing')).toBe('ACTIVE');
    expect(mapStripeSubscriptionStatus('past_due')).toBe('PAST_DUE');
    expect(mapStripeSubscriptionStatus('unpaid')).toBe('PAST_DUE');
    expect(mapStripeSubscriptionStatus('canceled')).toBe('CANCELED');
    expect(mapStripeSubscriptionStatus('incomplete_expired')).toBe('EXPIRED');
    expect(mapStripeSubscriptionStatus('paused')).toBe('EXPIRED');
  });

  it('resolves plan code from explicit metadata before price fallbacks', () => {
    expect(
      resolvePlanCodeFromMetadata(
        { kclub_membership_type: VIP_PLAN_CODE },
        'price_bus',
        'price_vip',
        'price_bus',
      ),
    ).toBe(VIP_PLAN_CODE);

    expect(resolvePlanCodeFromMetadata({}, 'price_bus', 'price_vip', 'price_bus')).toBe(
      BUSINESS_PLAN_CODE,
    );
    expect(resolvePlanCodeFromMetadata({}, null, 'price_vip', 'price_bus')).toBe(VIP_PLAN_CODE);
  });

  it('extracts period boundaries from Stripe subscriptions', () => {
    const subscription = {
      current_period_end: 1719792000,
      current_period_start: 1717200000,
    } as unknown as Stripe.Subscription;

    expect(getSubscriptionPeriodEnd(subscription)?.getTime()).toBe(1719792000 * 1000);
    expect(getSubscriptionPeriodStart(subscription)?.getTime()).toBe(1717200000 * 1000);
    expect(getSubscriptionPeriodEnd({ current_period_end: 0 } as Stripe.Subscription)).toBeNull();
  });

  it('detects status or period-end transitions', () => {
    expect(
      hasMembershipTransitionChanged({
        currentEndsAt: new Date('2026-07-01'),
        currentStatus: 'ACTIVE',
        nextEndsAt: new Date('2026-07-01'),
        nextStatus: 'CANCELED',
      }),
    ).toBe(true);

    const samePeriodEnd = new Date('2026-07-01');
    expect(
      hasMembershipTransitionChanged({
        currentEndsAt: samePeriodEnd,
        currentStatus: 'ACTIVE',
        nextEndsAt: samePeriodEnd,
        nextStatus: 'ACTIVE',
      }),
    ).toBe(false);

    expect(
      hasMembershipTransitionChanged({
        currentEndsAt: new Date('2026-07-01'),
        currentStatus: 'PAST_DUE',
        nextEndsAt: new Date('2026-07-01'),
        nextStatus: 'CANCELED',
      }),
    ).toBe(true);
  });

  it('prefers active higher-tier memberships when resolving effective access', () => {
    const effective = resolveEffectiveMembership([
      { planCode: FREE_PLAN_CODE, status: 'ACTIVE', updatedAt: new Date('2026-01-01') },
      { planCode: VIP_PLAN_CODE, status: 'ACTIVE', updatedAt: new Date('2026-06-01') },
      { planCode: BUSINESS_PLAN_CODE, status: 'ACTIVE', updatedAt: new Date('2026-05-01') },
    ]);

    expect(effective?.planCode).toBe(VIP_PLAN_CODE);
  });

  it('falls back to active free access when a paid membership is no longer active', () => {
    const effective = resolveEffectiveMembership([
      { planCode: FREE_PLAN_CODE, status: 'ACTIVE', updatedAt: new Date('2026-01-01') },
      { planCode: VIP_PLAN_CODE, status: 'PAST_DUE', updatedAt: new Date('2026-06-01') },
    ]);

    expect(effective?.planCode).toBe(FREE_PLAN_CODE);
  });

  it('falls back to the latest row when nothing is active', () => {
    const effective = resolveEffectiveMembership([
      { planCode: FREE_PLAN_CODE, status: 'INACTIVE', updatedAt: new Date('2026-01-01') },
      { planCode: VIP_PLAN_CODE, status: 'PAST_DUE', updatedAt: new Date('2026-06-01') },
    ]);

    expect(effective?.planCode).toBe(VIP_PLAN_CODE);
  });

  it('accepts only paid subscription sessions that belong to the current user', () => {
    const goodSession = {
      metadata: {
        kclub_membership_type: BUSINESS_PLAN_CODE,
        kclub_user_id: 'user_1',
      },
      mode: 'subscription',
      payment_status: 'paid',
      subscription: 'sub_456',
    } as unknown as Stripe.Checkout.Session;

    expect(
      resolveCheckoutReconciliationInput(goodSession, 'user_1', 'price_vip', 'price_bus'),
    ).toEqual({
      planCode: BUSINESS_PLAN_CODE,
      subscriptionId: 'sub_456',
    });

    const foreignSession = {
      ...goodSession,
      metadata: {
        ...goodSession.metadata,
        kclub_user_id: 'user_2',
      },
    } as Stripe.Checkout.Session;

    expect(
      resolveCheckoutReconciliationInput(foreignSession, 'user_1', 'price_vip', 'price_bus'),
    ).toBeNull();
  });

  it('rejects checkout sessions that are not paid subscriptions', () => {
    const unpaidSession = {
      metadata: {
        kclub_membership_type: VIP_PLAN_CODE,
        kclub_user_id: 'user_1',
      },
      mode: 'subscription',
      payment_status: 'unpaid',
      subscription: 'sub_456',
    } as unknown as Stripe.Checkout.Session;
    const oneTimePaymentSession = {
      ...unpaidSession,
      mode: 'payment',
      payment_status: 'paid',
      subscription: null,
    } as Stripe.Checkout.Session;

    expect(
      resolveCheckoutReconciliationInput(unpaidSession, 'user_1', 'price_vip', 'price_bus'),
    ).toBeNull();
    expect(
      resolveCheckoutReconciliationInput(oneTimePaymentSession, 'user_1', 'price_vip', 'price_bus'),
    ).toBeNull();
  });
});
