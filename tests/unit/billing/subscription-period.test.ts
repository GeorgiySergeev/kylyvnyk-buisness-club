import assert from 'node:assert/strict';
import { test } from 'vitest';

import { getSubscriptionPeriodEnd } from '../../../src/lib/stripe/subscription-period';

test('getSubscriptionPeriodEnd reads period end from subscription root', () => {
  const periodEnd = getSubscriptionPeriodEnd({
    current_period_end: 1_735_689_600,
    items: { data: [] },
  } as never);

  assert.equal(periodEnd?.toISOString(), '2025-01-01T00:00:00.000Z');
});
