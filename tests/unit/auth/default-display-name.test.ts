import assert from 'node:assert/strict';
import { test } from 'vitest';

import { deriveDefaultDisplayNameFromCardNumber } from '../../../src/features/auth/lib/card-number';

test('default display name uses card digits when present', () => {
  const value = deriveDefaultDisplayNameFromCardNumber('VIP-US-0123456789');
  assert.equal(value, 'user_0123456789');
});

test('default display name falls back to sanitized suffix when no digits', () => {
  const value = deriveDefaultDisplayNameFromCardNumber('VIP-US-ABCDEFGHJK');
  assert.equal(value, 'user_abcdefghjk');
});
