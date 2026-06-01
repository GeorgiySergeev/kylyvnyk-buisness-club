import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizePhoneNumber,
  phoneOtpRequestSchema,
  phoneOtpVerifySchema,
} from '../../src/features/auth/lib/phone';

test('normalizes an international phone number', () => {
  assert.equal(normalizePhoneNumber(' +1 (555) 000-0001 '), '+15550000001');
});

test('accepts valid phone auth request input', () => {
  const parsed = phoneOtpRequestSchema.safeParse({
    phone: '+380 50 123 45 67',
    displayName: 'Legacy Name',
  });

  assert.equal(parsed.success, true);

  if (parsed.success) {
    assert.equal(parsed.data.phone, '+380501234567');
    assert.equal('displayName' in parsed.data, false);
  }
});

test('rejects invalid phone auth request input', () => {
  const parsed = phoneOtpRequestSchema.safeParse({
    phone: '123',
  });

  assert.equal(parsed.success, false);
});

test('accepts a 6 digit SMS code', () => {
  const parsed = phoneOtpVerifySchema.safeParse({
    code: '123456',
    phone: '+15550000001',
  });

  assert.equal(parsed.success, true);
});

test('rejects malformed SMS code', () => {
  const parsed = phoneOtpVerifySchema.safeParse({
    code: '12345a',
    phone: '+15550000001',
  });

  assert.equal(parsed.success, false);
});
