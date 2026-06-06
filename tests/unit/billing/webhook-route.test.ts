import assert from 'node:assert/strict';
import { test } from 'vitest';
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
import { mapStripeSubscriptionStatus } from '../../../src/lib/stripe/subscription-period';

// ---------------------------------------------------------------------------
// Tests for the plan-code + status resolution logic that underpins the
// customer.subscription.created and invoice.payment_failed webhook handlers.
//
// These handlers call applySubscriptionState which uses:
//   - resolvePlanCodeFromMetadata  (plan resolution from Stripe metadata)
//   - mapStripeSubscriptionStatus  (Stripe → internal status mapping)
//   - hasMembershipTransitionChanged (audit-log transition detection)
// ---------------------------------------------------------------------------

// -- customer.subscription.created scenarios --------------------------------

test('subscription.created: resolves VIP plan from explicit metadata', () => {
  assert.equal(
    resolvePlanCodeFromMetadata(
      { kclub_membership_type: VIP_PLAN_CODE },
      'price_vip',
      'price_vip',
      'price_bus',
    ),
    VIP_PLAN_CODE,
  );
});

test('subscription.created: resolves BUSINESS plan from explicit metadata', () => {
  assert.equal(
    resolvePlanCodeFromMetadata(
      { kclub_membership_type: BUSINESS_PLAN_CODE },
      'price_bus',
      'price_vip',
      'price_bus',
    ),
    BUSINESS_PLAN_CODE,
  );
});

test('subscription.created: falls back to price ID when metadata is empty', () => {
  assert.equal(
    resolvePlanCodeFromMetadata({}, 'price_bus', 'price_vip', 'price_bus'),
    BUSINESS_PLAN_CODE,
  );
});

test('subscription.created: defaults to VIP when metadata and price ID are absent', () => {
  assert.equal(resolvePlanCodeFromMetadata({}, null, 'price_vip', 'price_bus'), VIP_PLAN_CODE);
});

// -- invoice.payment_failed status mapping scenarios -------------------------

test('payment_failed: maps Stripe past_due to internal PAST_DUE', () => {
  assert.equal(mapStripeSubscriptionStatus('past_due'), 'PAST_DUE');
});

test('payment_failed: maps Stripe unpaid to internal PAST_DUE', () => {
  assert.equal(mapStripeSubscriptionStatus('unpaid'), 'PAST_DUE');
});

test('payment_failed: maps Stripe active to internal ACTIVE (not yet transitioned)', () => {
  // Stripe may still report the subscription as 'active' at the moment
  // invoice.payment_failed fires — the transition to past_due happens later.
  assert.equal(mapStripeSubscriptionStatus('active'), 'ACTIVE');
});

test('payment_failed: maps Stripe canceled to internal CANCELED', () => {
  assert.equal(mapStripeSubscriptionStatus('canceled'), 'CANCELED');
});

// -- transition detection for audit logging after payment failure -----------

test('transition: ACTIVE → PAST_DUE is detected as a change', () => {
  assert.equal(
    hasMembershipTransitionChanged({
      currentEndsAt: new Date('2026-07-01'),
      currentStatus: 'ACTIVE',
      nextEndsAt: new Date('2026-07-01'),
      nextStatus: 'PAST_DUE',
    }),
    true,
  );
});

test('transition: PAST_DUE → PAST_DUE with same period end is NOT a change', () => {
  const periodEnd = new Date('2026-07-01');
  assert.equal(
    hasMembershipTransitionChanged({
      currentEndsAt: periodEnd,
      currentStatus: 'PAST_DUE',
      nextEndsAt: periodEnd,
      nextStatus: 'PAST_DUE',
    }),
    false,
  );
});

test('transition: PAST_DUE → CANCELED is detected as a change', () => {
  assert.equal(
    hasMembershipTransitionChanged({
      currentEndsAt: new Date('2026-07-01'),
      currentStatus: 'PAST_DUE',
      nextEndsAt: new Date('2026-07-01'),
      nextStatus: 'CANCELED',
    }),
    true,
  );
});

// -- effective membership resolution after payment failure ------------------

test('effective: PAST_DUE VIP loses to ACTIVE FREE', () => {
  const effective = resolveEffectiveMembership([
    { planCode: FREE_PLAN_CODE, status: 'ACTIVE', updatedAt: new Date('2026-01-01') },
    { planCode: VIP_PLAN_CODE, status: 'PAST_DUE', updatedAt: new Date('2026-06-01') },
  ]);

  assert.equal(effective?.planCode, FREE_PLAN_CODE);
});

test('effective: PAST_DUE VIP wins over INACTIVE FREE', () => {
  const effective = resolveEffectiveMembership([
    { planCode: FREE_PLAN_CODE, status: 'INACTIVE', updatedAt: new Date('2026-01-01') },
    { planCode: VIP_PLAN_CODE, status: 'PAST_DUE', updatedAt: new Date('2026-06-01') },
  ]);

  // No active rows → falls back to latest by updatedAt
  assert.equal(effective?.planCode, VIP_PLAN_CODE);
});

// -- checkout reconciliation (defense in depth for subscription.created) ----

test('reconciliation: resolves BUSINESS plan for subscription.created via checkout', () => {
  const session = {
    metadata: { kclub_membership_type: BUSINESS_PLAN_CODE, kclub_user_id: 'user_1' },
    mode: 'subscription',
    payment_status: 'paid',
    subscription: 'sub_456',
  } as unknown as Stripe.Checkout.Session;

  const result = resolveCheckoutReconciliationInput(session, 'user_1', 'price_vip', 'price_bus');

  assert.deepEqual(result, {
    planCode: BUSINESS_PLAN_CODE,
    subscriptionId: 'sub_456',
  });
});

test('reconciliation: rejects non-subscription mode', () => {
  const session = {
    metadata: { kclub_membership_type: VIP_PLAN_CODE, kclub_user_id: 'user_1' },
    mode: 'payment',
    payment_status: 'paid',
    subscription: null,
  } as unknown as Stripe.Checkout.Session;

  assert.equal(
    resolveCheckoutReconciliationInput(session, 'user_1', 'price_vip', 'price_bus'),
    null,
  );
});
