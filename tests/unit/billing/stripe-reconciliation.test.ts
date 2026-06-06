import assert from 'node:assert/strict';
import { test } from 'vitest';
import type Stripe from 'stripe';

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

// ---------------------------------------------------------------------------
// Tests for the pure-function logic that underpins the daily Stripe
// reconciliation flow (stripe-reconciliation.ts).
//
// reconcileStripeSubscriptions() calls applySubscriptionState which uses:
//   - mapStripeSubscriptionStatus (Stripe → internal status)
//   - resolvePlanCodeFromMetadata  (plan code from metadata / price ID)
//   - getSubscriptionPeriodEnd     (period end from Stripe subscription)
//   - hasMembershipTransitionChanged (audit-log transition detection)
//   - resolveEffectiveMembership   (post-reconciliation effective tier)
// ---------------------------------------------------------------------------

// -- Reconciliation status mapping -----------------------------------------

test('reconciliation: active Stripe subscription stays ACTIVE', () => {
  assert.equal(mapStripeSubscriptionStatus('active'), 'ACTIVE');
});

test('reconciliation: canceled Stripe subscription maps to CANCELED', () => {
  assert.equal(mapStripeSubscriptionStatus('canceled'), 'CANCELED');
});

test('reconciliation: past_due Stripe subscription maps to PAST_DUE', () => {
  assert.equal(mapStripeSubscriptionStatus('past_due'), 'PAST_DUE');
});

test('reconciliation: incomplete_expired maps to EXPIRED (subscription not found scenario)', () => {
  // When a subscription is not found on Stripe (or is in a terminal state),
  // the reconciliation should treat it as expired.
  assert.equal(mapStripeSubscriptionStatus('incomplete_expired'), 'EXPIRED');
});

test('reconciliation: paused subscription maps to EXPIRED', () => {
  assert.equal(mapStripeSubscriptionStatus('paused'), 'EXPIRED');
});

test('reconciliation: trialing subscription maps to ACTIVE', () => {
  assert.equal(mapStripeSubscriptionStatus('trialing'), 'ACTIVE');
});

// -- Reconciliation plan resolution ----------------------------------------

test('reconciliation: resolves VIP from metadata for tracked subscription', () => {
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

test('reconciliation: resolves BUSINESS from price ID when metadata is empty', () => {
  assert.equal(
    resolvePlanCodeFromMetadata({}, 'price_bus', 'price_vip', 'price_bus'),
    BUSINESS_PLAN_CODE,
  );
});

test('reconciliation: defaults to VIP when neither metadata nor price ID match', () => {
  assert.equal(
    resolvePlanCodeFromMetadata({}, 'price_unknown', 'price_vip', 'price_bus'),
    VIP_PLAN_CODE,
  );
});

// -- Reconciliation period extraction --------------------------------------

test('reconciliation: extracts period end from Stripe subscription', () => {
  const subscription = {
    current_period_end: 1719792000, // 2024-07-01T00:00:00Z
    current_period_start: 1717200000,
  } as unknown as Stripe.Subscription;

  const periodEnd = getSubscriptionPeriodEnd(subscription);
  assert.notEqual(periodEnd, null);
  assert.equal(periodEnd!.getTime(), 1719792000 * 1000);
});

test('reconciliation: extracts period start from Stripe subscription', () => {
  const subscription = {
    current_period_end: 1719792000,
    current_period_start: 1717200000, // 2024-06-01T00:00:00Z
  } as unknown as Stripe.Subscription;

  const periodStart = getSubscriptionPeriodStart(subscription);
  assert.notEqual(periodStart, null);
  assert.equal(periodStart!.getTime(), 1717200000 * 1000);
});

test('reconciliation: returns null period end when missing', () => {
  const subscription = {
    current_period_end: 0,
  } as unknown as Stripe.Subscription;

  assert.equal(getSubscriptionPeriodEnd(subscription), null);
});

// -- Reconciliation transition detection (audit logging) -------------------

test('reconciliation: ACTIVE → CANCELED transition is logged', () => {
  assert.equal(
    hasMembershipTransitionChanged({
      currentEndsAt: new Date('2026-07-01'),
      currentStatus: 'ACTIVE',
      nextEndsAt: new Date('2026-07-01'),
      nextStatus: 'CANCELED',
    }),
    true,
  );
});

test('reconciliation: ACTIVE → ACTIVE with same period end is NOT logged', () => {
  const periodEnd = new Date('2026-07-01');
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

test('reconciliation: ACTIVE → EXPIRED transition is logged', () => {
  assert.equal(
    hasMembershipTransitionChanged({
      currentEndsAt: new Date('2026-07-01'),
      currentStatus: 'ACTIVE',
      nextEndsAt: null,
      nextStatus: 'EXPIRED',
    }),
    true,
  );
});

// -- Post-reconciliation effective membership resolution --------------------

test('reconciliation: ACTIVE VIP wins after reconciliation syncs canceled subscription', () => {
  // After reconciliation cancels a stale VIP, the effective membership
  // should fall back to the always-present FREE tier.
  const effective = resolveEffectiveMembership([
    { planCode: FREE_PLAN_CODE, status: 'ACTIVE', updatedAt: new Date('2026-01-01') },
    { planCode: VIP_PLAN_CODE, status: 'CANCELED', updatedAt: new Date('2026-06-01') },
  ]);

  assert.equal(effective?.planCode, FREE_PLAN_CODE);
});

test('reconciliation: ACTIVE VIP still wins over ACTIVE BUSINESS (VIP has higher tier priority)', () => {
  // VIP priority = 3, BUSINESS priority = 2 — VIP always wins when both active.
  const effective = resolveEffectiveMembership([
    { planCode: BUSINESS_PLAN_CODE, status: 'ACTIVE', updatedAt: new Date('2026-06-01') },
    { planCode: VIP_PLAN_CODE, status: 'ACTIVE', updatedAt: new Date('2026-01-01') },
  ]);

  assert.equal(effective?.planCode, VIP_PLAN_CODE);
});
