import { isRealSupabaseUserId } from './supabase-user-id';

export type AuthIntent = 'sign-in' | 'sign-up';

export type PhoneAccessState = 'unknown' | 'phone_only' | 'linked';

export type AuthIntentErrorCode = 'ACCOUNT_ALREADY_EXISTS' | 'ACCOUNT_NOT_APPROVED';

export function getPhoneAccessState(
  user: { supabaseUserId: string | null } | null | undefined,
): PhoneAccessState {
  if (!user) {
    return 'unknown';
  }

  if (isRealSupabaseUserId(user.supabaseUserId)) {
    return 'linked';
  }

  return 'phone_only';
}

export function getAuthIntentError(
  intent: AuthIntent,
  accessState: PhoneAccessState,
): AuthIntentErrorCode | null {
  if (accessState === 'unknown') {
    return 'ACCOUNT_NOT_APPROVED';
  }

  if (intent === 'sign-up' && accessState === 'linked') {
    return 'ACCOUNT_ALREADY_EXISTS';
  }

  return null;
}

export function getAuthErrorLink(errorCode: AuthIntentErrorCode): '/sign-in' | null {
  if (errorCode === 'ACCOUNT_ALREADY_EXISTS') {
    return '/sign-in';
  }

  return null;
}

/**
 * Pre-approved phone-only rows exist in app DB but not yet in Supabase Auth.
 * Allow Supabase to create the auth user only after app-side pre-approval passed.
 * Linked members must not trigger auth user creation from the public OTP endpoint.
 */
export function shouldCreateSupabaseUserForOtp(accessState: PhoneAccessState): boolean {
  return accessState === 'phone_only';
}
