import assert from 'node:assert/strict';
import test from 'node:test';

import {
  generateCardNumber,
  shouldRotateCardNumber,
} from '../../src/features/auth/lib/card-number';

test('generateCardNumber uses VIP prefix for VIP members', () => {
  const number = generateCardNumber('+14155550123', 'VIP');
  assert.match(number, /^vip-US-[0-9A-HJKMNP-TV-Z]{10}$/);
});

test('generateCardNumber uses FREE prefix for free members', () => {
  const number = generateCardNumber('+14155550123', 'FREE');
  assert.match(number, /^FREE-US-[0-9A-HJKMNP-TV-Z]{10}$/);
});

test('generateCardNumber uses business prefix for business members', () => {
  const number = generateCardNumber('+380971112233', 'BUSINESS');
  assert.match(number, /^business-UA-[0-9A-HJKMNP-TV-Z]{10}$/);
});

test('shouldRotateCardNumber returns true when tier changes', () => {
  assert.equal(shouldRotateCardNumber('FREE', 'VIP'), true);
  assert.equal(shouldRotateCardNumber('VIP', 'FREE'), true);
});

test('shouldRotateCardNumber returns false when tier stays the same', () => {
  assert.equal(shouldRotateCardNumber('VIP', 'VIP'), false);
});
