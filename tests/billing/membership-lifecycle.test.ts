import assert from 'node:assert/strict';
import test from 'node:test';

import type Stripe from 'stripe';

import { resolveCheckoutReconciliationInput } from '../../src/features/billing/lib/checkout-reconciliation';
import { resolvePlanCodeFromMetadata } from '../../src/features/billing/lib/membership-plan';
import {
  hasMembershipTransitionChanged,
  resolveEffectiveMembership,
} from '../../src/features/billing/lib/membership-resolver';
import { BUSINESS_PLAN_CODE, FREE_PLAN_CODE, VIP_PLAN_CODE } from '../../src/features/billing/lib/plan-codes';
import { mapStripeSubscriptionStatus } from '../../src/lib/stripe/subscription-period';

test('resolvePlanCodeFromMetadata prefers explicit membership type', () => {
  assert.equal(
    resolvePlanCodeFromMetadata({ kclub_membership_type: 'BUSINESS' }, null, 'price_vip', 'price_bus'),
    BUSINESS_PLAN_CODE,
  );
});

test('resolvePlanCodeFromMetadata falls back to business price id', () => {
  assert.equal(
    resolvePlanCodeFromMetadata({}, 'price_bus', 'price_vip', 'price_bus'),
    BUSINESS_PLAN_CODE,
  );
});

test('resolvePlanCodeFromMetadata defaults to VIP', () => {
  assert.equal(resolvePlanCodeFromMetadata({}, 'price_vip', 'price_vip', 'price_bus'), VIP_PLAN_CODE);
});

test('mapStripeSubscriptionStatus maps active subscriptions', () => {
  assert.equal(mapStripeSubscriptionStatus('active'), 'ACTIVE');
  assert.equal(mapStripeSubscriptionStatus('past_due'), 'PAST_DUE');
  assert.equal(mapStripeSubscriptionStatus('canceled'), 'CANCELED');
});

test('resolveEffectiveMembership returns free for new registered users without paid access', () => {
  const effective = resolveEffectiveMembership([
    {
      planCode: FREE_PLAN_CODE,
      status: 'ACTIVE',
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ]);

  assert.equal(effective?.planCode, FREE_PLAN_CODE);
});

test('resolveEffectiveMembership lets active VIP win over active free', () => {
  const effective = resolveEffectiveMembership([
    {
      planCode: FREE_PLAN_CODE,
      status: 'ACTIVE',
      updatedAt: new Date('2026-06-01T00:00:00.000Z'),
    },
    {
      planCode: VIP_PLAN_CODE,
      status: 'ACTIVE',
      updatedAt: new Date('2026-05-01T00:00:00.000Z'),
    },
  ]);

  assert.equal(effective?.planCode, VIP_PLAN_CODE);
});

test('resolveEffectiveMembership falls back to latest non-active row when no active tier exists', () => {
  const effective = resolveEffectiveMembership([
    {
      planCode: VIP_PLAN_CODE,
      status: 'CANCELED',
      updatedAt: new Date('2026-05-01T00:00:00.000Z'),
    },
    {
      planCode: FREE_PLAN_CODE,
      status: 'INACTIVE',
      updatedAt: new Date('2026-06-01T00:00:00.000Z'),
    },
  ]);

  assert.equal(effective?.planCode, FREE_PLAN_CODE);
});

test('resolveCheckoutReconciliationInput accepts paid subscription sessions for the current user', () => {
  const session = {
    id: 'cs_test_123',
    metadata: {
      kclub_membership_type: VIP_PLAN_CODE,
      kclub_user_id: 'user_123',
    },
    mode: 'subscription',
    payment_status: 'paid',
    subscription: 'sub_123',
  } as unknown as Stripe.Checkout.Session;

  const input = resolveCheckoutReconciliationInput(session, 'user_123', 'price_vip', 'price_bus');

  assert.deepEqual(input, {
    planCode: VIP_PLAN_CODE,
    subscriptionId: 'sub_123',
  });
});

test('resolveCheckoutReconciliationInput rejects sessions for another user', () => {
  const session = {
    id: 'cs_test_123',
    metadata: {
      kclub_membership_type: VIP_PLAN_CODE,
      kclub_user_id: 'user_123',
    },
    mode: 'subscription',
    payment_status: 'paid',
    subscription: 'sub_123',
  } as unknown as Stripe.Checkout.Session;

  assert.equal(resolveCheckoutReconciliationInput(session, 'user_456', 'price_vip', 'price_bus'), null);
});

test('resolveCheckoutReconciliationInput rejects unpaid checkout sessions', () => {
  const session = {
    id: 'cs_test_123',
    metadata: {
      kclub_membership_type: VIP_PLAN_CODE,
      kclub_user_id: 'user_123',
    },
    mode: 'subscription',
    payment_status: 'unpaid',
    subscription: 'sub_123',
  } as unknown as Stripe.Checkout.Session;

  assert.equal(resolveCheckoutReconciliationInput(session, 'user_123', 'price_vip', 'price_bus'), null);
});

test('hasMembershipTransitionChanged is false for repeated same status and period end', () => {
  const periodEnd = new Date('2026-07-01T00:00:00.000Z');

  assert.equal(
    hasMembershipTransitionChanged({
      currentEndsAt: periodEnd,
      currentStatus: 'ACTIVE',
      nextEndsAt: periodEnd,
      nextStatus: 'ACTIVE',
    }),
    false,
  );
});

test('hasMembershipTransitionChanged is true when status changes', () => {
  assert.equal(
    hasMembershipTransitionChanged({
      currentEndsAt: null,
      currentStatus: 'ACTIVE',
      nextEndsAt: null,
      nextStatus: 'PAST_DUE',
    }),
    true,
  );
});
