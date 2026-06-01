'use server';

import { cookies, headers } from 'next/headers';

import type { SupportedLocale } from '@/components/layout/navigation';
import { getAuthIdentity, isAuthDevPhoneBypassEnabled } from '@/features/auth/lib/auth-identity';
import { createCardForUser } from '@/features/auth/lib/card';
import { findExistingUserByIdentity, findExistingUserByPhone } from '@/features/auth/lib/current-user';
import { DEV_PHONE_AUTH_COOKIE, encodeDevPhoneAuthCookie } from '@/features/auth/lib/dev-auth';
import { getAuthIntentError, type AuthIntent } from '@/features/auth/lib/phone-auth-intent';
import { phoneOtpRequestSchema, phoneOtpVerifySchema } from '@/features/auth/lib/phone';
import { resolvePostAuthRedirect } from '@/features/auth/lib/resolve-post-auth-redirect';
import { syncAuthUser } from '@/features/auth/lib/sync-auth-user';
import { verifyTurnstileToken } from '@/lib/captcha/turnstile';
import { getT } from '@/lib/i18n/t-server';
import { checkSmsOtpRateLimit } from '@/lib/rate-limit/upstash';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type AuthActionErrorCode =
  | 'ACCOUNT_ALREADY_EXISTS'
  | 'ACCOUNT_NOT_FOUND'
  | 'DEV_BYPASS_DISABLED'
  | 'OTP_REQUEST_FAILED'
  | 'OTP_VERIFY_FAILED'
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
  const intentError = getAuthIntentError(intent, Boolean(existingUser));
  if (intentError === 'ACCOUNT_NOT_FOUND') {
    return {
      error: {
        code: 'ACCOUNT_NOT_FOUND',
        message: tAuth('phoneAuthAccountNotFound'),
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

  // Rate Limiting
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const rateLimitId = `${parsed.data.phone}:${ip}`;
  
  const rateLimitResult = await checkSmsOtpRateLimit(rateLimitId);
  if (!rateLimitResult.success) {
    return {
      error: {
        code: 'OTP_REQUEST_FAILED',
        message: tAuth('phoneAuthRateLimitError'),
      },
      ok: false,
    };
  }

  // Turnstile Verification
  const isCaptchaValid = await verifyTurnstileToken(parsed.data.captchaToken || '', ip);
  if (!isCaptchaValid) {
    return {
      error: {
        code: 'OTP_REQUEST_FAILED',
        message: tAuth('phoneAuthCaptchaError'),
      },
      ok: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone: parsed.data.phone,
  });

  if (error) {
    return {
      error: {
        code: 'OTP_REQUEST_FAILED',
        message: 'Could not send the SMS code. Please try again.',
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
  intent: AuthIntent,
  rawInput: unknown,
): Promise<AuthActionResult<{ redirectTo: string }>> {
  const parsed = phoneOtpVerifySchema.safeParse(rawInput);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

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
        message: 'The code could not be verified. Please try again.',
      },
      ok: false,
    };
  }

  const identity = await getAuthIdentity();

  if (!identity) {
    return {
      error: {
        code: 'UNAUTHORIZED',
        message: 'The verified session could not be loaded. Please try again.',
      },
      ok: false,
    };
  }

  if (intent === 'sign-in') {
    const user = await findExistingUserByIdentity(identity);
    if (!user) {
      await supabase.auth.signOut();
      return {
        error: {
          code: 'ACCOUNT_NOT_FOUND',
          message: getT('auth', locale)('phoneAuthAccountNotFound'),
        },
        ok: false,
      };
    }

    const redirectTo = await resolvePostAuthRedirect(
      locale,
      user.id,
      parsed.data.returnBackUrl,
    );

    return {
      data: {
        redirectTo,
      },
      ok: true,
    };
  }

  const { isNew, user } = await syncAuthUser(identity);
  if (isNew) {
    await createCardForUser(user.id, user.phone);
  }

  const redirectTo = await resolvePostAuthRedirect(
    locale,
    user.id,
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

  const existingUser = await findExistingUserByPhone(parsed.data.phone);
  const tAuth = getT('auth', locale);
  const intentError = getAuthIntentError(intent, Boolean(existingUser));
  if (intentError === 'ACCOUNT_NOT_FOUND') {
    return {
      error: {
        code: 'ACCOUNT_NOT_FOUND',
        message: tAuth('phoneAuthAccountNotFound'),
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

  (await cookies()).set({
    httpOnly: true,
    name: DEV_PHONE_AUTH_COOKIE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    value: encodeDevPhoneAuthCookie(parsed.data.phone),
  });

  const { isNew, user } = await syncAuthUser({
    devBypass: true,
    phone: parsed.data.phone,
    providerUserId: `dev:${parsed.data.phone}`,
  });

  if (isNew) {
    await createCardForUser(user.id, user.phone);
  }

  const redirectTo = await resolvePostAuthRedirect(
    locale,
    user.id,
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
