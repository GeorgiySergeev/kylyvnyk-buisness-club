import assert from 'node:assert/strict';
import test from 'node:test';

import { resolvePlanCodeFromMetadata } from '../../src/features/billing/lib/membership-plan';
import { BUSINESS_PLAN_CODE, VIP_PLAN_CODE } from '../../src/features/billing/lib/plan-codes';
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
