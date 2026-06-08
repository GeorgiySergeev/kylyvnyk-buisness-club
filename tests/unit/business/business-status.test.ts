import assert from 'node:assert/strict';
import { test } from 'vitest';

import { normalizeBusinessStatus } from '../../../src/features/business/lib/business-status';

test('normalizeBusinessStatus maps legacy review statuses to the active contract', () => {
  assert.equal(normalizeBusinessStatus('PENDING'), 'UNDER_REVIEW');
  assert.equal(normalizeBusinessStatus('DRAFT'), 'UNDER_REVIEW');
  assert.equal(normalizeBusinessStatus('DECLINED'), 'HIDDEN');
  assert.equal(normalizeBusinessStatus('PUBLISHED'), 'PUBLISHED');
});
