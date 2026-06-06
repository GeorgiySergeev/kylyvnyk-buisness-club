import { describe, expect, it } from 'vitest';

import {
  getAuthErrorLink,
  getAuthIntentError,
} from '../../../src/features/auth/lib/phone-auth-intent';

describe('phone auth intent', () => {
  it('returns ACCOUNT_NOT_FOUND for sign-in with an unknown phone', () => {
    expect(getAuthIntentError('sign-in', false)).toBe('ACCOUNT_NOT_FOUND');
  });

  it('allows sign-in for an existing phone', () => {
    expect(getAuthIntentError('sign-in', true)).toBeNull();
  });

  it('returns ACCOUNT_ALREADY_EXISTS for sign-up with an existing phone', () => {
    expect(getAuthIntentError('sign-up', true)).toBe('ACCOUNT_ALREADY_EXISTS');
  });

  it('allows sign-up for an unknown phone', () => {
    expect(getAuthIntentError('sign-up', false)).toBeNull();
  });

  it('points auth intent errors at the opposite route', () => {
    expect(getAuthErrorLink('ACCOUNT_NOT_FOUND')).toBe('/sign-up');
    expect(getAuthErrorLink('ACCOUNT_ALREADY_EXISTS')).toBe('/sign-in');
  });
});
