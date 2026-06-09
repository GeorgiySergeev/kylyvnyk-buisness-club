'use server';

import { cookies, headers } from 'next/headers';

import type { SupportedLocale } from '@/components/layout/navigation';
import { getAuthIdentity, isAuthDevPhoneBypassEnabled } from '@/features/auth/lib/auth-identity';
import { claimPreApprovedUser } from '@/features/auth/lib/claim-pre-approved-user';
import { findExistingUserByPhone } from '@/features/auth/lib/current-user';
import { DEV_PHONE_AUTH_COOKIE, encodeDevPhoneAuthCookie } from '@/features/auth/lib/dev-auth';
import { resolveOtpSendFailureMessage } from '@/features/auth/lib/otp-send-error';
import { phoneOtpRequestSchema, phoneOtpVerifySchema } from '@/features/auth/lib/phone';
import {
  type AuthIntent,
  getAuthIntentError,
  getPhoneAccessState,
  shouldCreateSupabaseUserForOtp,
} from '@/features/auth/lib/phone-auth-intent';
import { resolvePostAuthRedirect } from '@/features/auth/lib/resolve-post-auth-redirect';
import { verifyTurnstileToken } from '@/lib/captcha/turnstile';
import { getT } from '@/lib/i18n/t-server';
import { log } from '@/lib/log';
import { checkSmsOtpRateLimit } from '@/lib/rate-limit/upstash';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type AuthActionErrorCode =
  | 'ACCOUNT_ALREADY_EXISTS'
  | 'ACCOUNT_NOT_APPROVED'
  | 'CAPTCHA_FAILED'
  | 'DEV_BYPASS_DISABLED'
  | 'OTP_SEND_FAILED'
  | 'OTP_VERIFY_FAILED'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR';

type AuthActionError = {
  code: AuthActionErrorCode;
  fieldErrors?: Record<string, string[] | undefined>;
  message: string;
};

type AuthActionResult<T> = { data: T; ok: true } | { error: AuthActionError; ok: false };

function validationError(
  fieldErrors: Record<string, string[] | undefined>,
): AuthActionResult<never> {
  return {
    error: {
      code: 'VALIDATION_ERROR',
      fieldErrors,
      message: 'Please review the highlighted fields.',
    },
    ok: false,
  };
}

type RequestOtpResult =
  | { data: { phone: string }; ok: true }
  | { error: AuthActionError; ok: false };

async function resolveIntentPolicyError(
  locale: SupportedLocale,
  intent: AuthIntent,
  phone: string,
): Promise<AuthActionError | null> {
  const existingUser = await findExistingUserByPhone(phone);
  const intentError = getAuthIntentError(intent, getPhoneAccessState(existingUser));
  const tAuth = getT('auth', locale);

  if (intentError === 'ACCOUNT_NOT_APPROVED') {
    return {
      code: 'ACCOUNT_NOT_APPROVED',
      message: tAuth('phoneAuthAccountNotApproved'),
    };
  }

  if (intentError === 'ACCOUNT_ALREADY_EXISTS') {
    return {
      code: 'ACCOUNT_ALREADY_EXISTS',
      message: tAuth('phoneAuthAccountExists'),
    };
  }

  return null;
}

export async function requestPhoneOtpAction(
  locale: SupportedLocale,
  intent: AuthIntent,
  rawInput: unknown,
): Promise<RequestOtpResult> {
  const parsed = phoneOtpRequestSchema.safeParse(rawInput);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const tAuth = getT('auth', locale);
  const existingUser = await findExistingUserByPhone(parsed.data.phone);
  const accessState = getPhoneAccessState(existingUser);
  const intentError = getAuthIntentError(intent, accessState);

  if (intentError === 'ACCOUNT_NOT_APPROVED') {
    return {
      error: {
        code: 'ACCOUNT_NOT_APPROVED',
        message: tAuth('phoneAuthAccountNotApproved'),
      },
      ok: false,
    };
  }

  if (intentError === 'ACCOUNT_ALREADY_EXISTS') {
    return {
      error: {
        code: 'ACCOUNT_ALREADY_EXISTS',
        message: tAuth('phoneAuthAccountExists'),
      },
      ok: false,
    };
  }

  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const rateLimitId = `${parsed.data.phone}:${ip}`;

  const rateLimitResult = await checkSmsOtpRateLimit(rateLimitId);
  if (!rateLimitResult.success) {
    return {
      error: {
        code: 'RATE_LIMITED',
        message: tAuth('phoneAuthRateLimitError'),
      },
      ok: false,
    };
  }

  const isCaptchaValid = await verifyTurnstileToken(parsed.data.captchaToken || '', ip);
  if (!isCaptchaValid) {
    return {
      error: {
        code: 'CAPTCHA_FAILED',
        message: tAuth('phoneAuthCaptchaError'),
      },
      ok: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  const shouldCreateUser = shouldCreateSupabaseUserForOtp(accessState);
  const { error } = await supabase.auth.signInWithOtp({
    phone: parsed.data.phone,
    options: {
      shouldCreateUser,
    },
  });

  if (error) {
    log.warn('Supabase OTP send failed', {
      accessState,
      cause: error.message,
      shouldCreateUser,
      status: error.status,
    });

    return {
      error: {
        code: 'OTP_SEND_FAILED',
        message: resolveOtpSendFailureMessage(error.message, tAuth),
      },
      ok: false,
    };
  }

  return {
    data: {
      phone: parsed.data.phone,
    },
    ok: true,
  };
}

export async function verifyPhoneOtpAction(
  locale: SupportedLocale,
  _intent: AuthIntent,
  rawInput: unknown,
): Promise<AuthActionResult<{ redirectTo: string }>> {
  const parsed = phoneOtpVerifySchema.safeParse(rawInput);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const tAuth = getT('auth', locale);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    phone: parsed.data.phone,
    token: parsed.data.code,
    type: 'sms',
  });

  if (error) {
    return {
      error: {
        code: 'OTP_VERIFY_FAILED',
        message: tAuth('phoneAuthOtpVerifyFailed'),
      },
      ok: false,
    };
  }

  const identity = await getAuthIdentity();

  if (!identity) {
    return {
      error: {
        code: 'UNAUTHORIZED',
        message: tAuth('phoneAuthSessionLoadFailed'),
      },
      ok: false,
    };
  }

  const claimResult = await claimPreApprovedUser(identity);

  if (!claimResult.ok) {
    await supabase.auth.signOut();
    return {
      error: {
        code: 'ACCOUNT_NOT_APPROVED',
        message: tAuth('phoneAuthAccountNotApproved'),
      },
      ok: false,
    };
  }

  const redirectTo = await resolvePostAuthRedirect(
    locale,
    claimResult.user.id,
    parsed.data.returnBackUrl,
  );

  return {
    data: {
      redirectTo,
    },
    ok: true,
  };
}

export async function devBypassPhoneAuthAction(
  locale: SupportedLocale,
  intent: AuthIntent,
  rawInput: unknown,
): Promise<AuthActionResult<{ redirectTo: string }>> {
  const parsed = phoneOtpRequestSchema.safeParse(rawInput);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  if (!isAuthDevPhoneBypassEnabled()) {
    return {
      error: {
        code: 'DEV_BYPASS_DISABLED',
        message: 'Development phone bypass is disabled.',
      },
      ok: false,
    };
  }

  const policyError = await resolveIntentPolicyError(locale, intent, parsed.data.phone);

  if (policyError) {
    return {
      error: policyError,
      ok: false,
    };
  }

  (await cookies()).set({
    httpOnly: true,
    name: DEV_PHONE_AUTH_COOKIE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    value: await encodeDevPhoneAuthCookie(parsed.data.phone),
  });

  const claimResult = await claimPreApprovedUser({
    devBypass: true,
    phone: parsed.data.phone,
    providerUserId: `dev:${parsed.data.phone}`,
  });

  if (!claimResult.ok) {
    (await cookies()).delete(DEV_PHONE_AUTH_COOKIE);
    return {
      error: {
        code: 'ACCOUNT_NOT_APPROVED',
        message: getT('auth', locale)('phoneAuthAccountNotApproved'),
      },
      ok: false,
    };
  }

  const redirectTo = await resolvePostAuthRedirect(
    locale,
    claimResult.user.id,
    parsed.data.returnBackUrl,
  );

  return {
    data: {
      redirectTo,
    },
    ok: true,
  };
}

export async function signOutAction(): Promise<AuthActionResult<{ ok: true }>> {
  const cookieStore = await cookies();
  cookieStore.delete(DEV_PHONE_AUTH_COOKIE);

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return {
    data: { ok: true },
    ok: true,
  };
}
