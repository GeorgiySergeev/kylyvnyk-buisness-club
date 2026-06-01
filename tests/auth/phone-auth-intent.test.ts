import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAuthErrorLink,
  getAuthIntentError,
} from '../../src/features/auth/lib/phone-auth-intent';

test('sign-in with unknown phone returns ACCOUNT_NOT_FOUND', () => {
  assert.equal(getAuthIntentError('sign-in', false), 'ACCOUNT_NOT_FOUND');
});

test('sign-in with existing phone is allowed', () => {
  assert.equal(getAuthIntentError('sign-in', true), null);
});

test('sign-up with existing phone returns ACCOUNT_ALREADY_EXISTS', () => {
  assert.equal(getAuthIntentError('sign-up', true), 'ACCOUNT_ALREADY_EXISTS');
});

test('sign-up with unknown phone is allowed', () => {
  assert.equal(getAuthIntentError('sign-up', false), null);
});

test('auth error link points to the opposite auth page', () => {
  assert.equal(getAuthErrorLink('ACCOUNT_NOT_FOUND'), '/sign-up');
  assert.equal(getAuthErrorLink('ACCOUNT_ALREADY_EXISTS'), '/sign-in');
});
