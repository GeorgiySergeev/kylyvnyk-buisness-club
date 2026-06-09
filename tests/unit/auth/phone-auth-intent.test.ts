import { describe, expect, it } from 'vitest';

import {
  getAuthErrorLink,
  getAuthIntentError,
  getPhoneAccessState,
  shouldCreateSupabaseUserForOtp,
} from '../../../src/features/auth/lib/phone-auth-intent';

describe('phone auth intent', () => {
  it('maps user records to phone access states', () => {
    expect(getPhoneAccessState(null)).toBe('unknown');
    expect(getPhoneAccessState({ supabaseUserId: null })).toBe('phone_only');
    expect(getPhoneAccessState({ supabaseUserId: 'dev:+380501234567' })).toBe('phone_only');
    expect(getPhoneAccessState({ supabaseUserId: 'auth-user-id' })).toBe('linked');
  });

  it('blocks unknown phones for sign-in and sign-up claim', () => {
    expect(getAuthIntentError('sign-in', 'unknown')).toBe('ACCOUNT_NOT_APPROVED');
    expect(getAuthIntentError('sign-up', 'unknown')).toBe('ACCOUNT_NOT_APPROVED');
  });

  it('allows sign-in and claim for phone-only pre-approved users', () => {
    expect(getAuthIntentError('sign-in', 'phone_only')).toBeNull();
    expect(getAuthIntentError('sign-up', 'phone_only')).toBeNull();
  });

  it('allows sign-in for linked users and redirects claim to sign-in', () => {
    expect(getAuthIntentError('sign-in', 'linked')).toBeNull();
    expect(getAuthIntentError('sign-up', 'linked')).toBe('ACCOUNT_ALREADY_EXISTS');
  });

  it('links only already-linked claim conflicts to sign-in', () => {
    expect(getAuthErrorLink('ACCOUNT_ALREADY_EXISTS')).toBe('/sign-in');
    expect(getAuthErrorLink('ACCOUNT_NOT_APPROVED')).toBeNull();
  });

  it('allows Supabase auth user creation only for phone-only pre-approved rows', () => {
    expect(shouldCreateSupabaseUserForOtp('phone_only')).toBe(true);
    expect(shouldCreateSupabaseUserForOtp('linked')).toBe(false);
  });
});
