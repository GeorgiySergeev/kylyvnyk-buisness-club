import assert from 'node:assert/strict';
import { test } from 'vitest';

import { isSafeReturnBackUrl } from '../../../src/features/auth/lib/return-back-url';

test('accepts protected member return paths', () => {
  assert.equal(isSafeReturnBackUrl('/en/m/dashboard'), true);
  assert.equal(isSafeReturnBackUrl('/ru/m/business/new'), true);
  assert.equal(isSafeReturnBackUrl('/uk/admin/users'), true);
});

test('rejects unsafe return paths', () => {
  assert.equal(isSafeReturnBackUrl('/en/sign-in'), false);
  assert.equal(isSafeReturnBackUrl('https://evil.example'), false);
  assert.equal(isSafeReturnBackUrl(undefined), false);
});
