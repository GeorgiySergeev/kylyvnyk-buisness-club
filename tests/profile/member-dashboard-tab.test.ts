import assert from 'node:assert/strict';
import test from 'node:test';

import { isMemberDashboardTab } from '../../src/features/member/lib/member-dashboard-tab';

test('isMemberDashboardTab accepts the subscription tab', () => {
  assert.equal(isMemberDashboardTab('subscription'), true);
});

test('isMemberDashboardTab rejects unknown values', () => {
  assert.equal(isMemberDashboardTab('billing'), false);
});
