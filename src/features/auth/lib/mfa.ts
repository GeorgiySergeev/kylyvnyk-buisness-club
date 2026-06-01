import 'server-only';

import { env } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

import { isMfaVerifiedFromAssuranceLevel } from './mfa-policy';

export function isMfaDevBypassEnabled() {
  return env.NODE_ENV !== 'production' && env.AUTH_DEV_2FA_BYPASS_ENABLED === '1';
}

export async function hasVerifiedMfaInSession() {
  if (isMfaDevBypassEnabled()) {
    return true;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (error) {
    return false;
  }

  return isMfaVerifiedFromAssuranceLevel(data);
}

export async function getVerifiedTotpFactorId() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.mfa.listFactors();

  if (error) {
    return null;
  }

  const verifiedTotpFactor = data.totp.find((factor) => factor.status === 'verified');

  return verifiedTotpFactor?.id ?? null;
}
