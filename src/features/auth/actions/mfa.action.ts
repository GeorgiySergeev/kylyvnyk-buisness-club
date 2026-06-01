'use server';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

import { getCurrentUserWithRole } from '../lib/current-user';
import { getVerifiedTotpFactorId, hasVerifiedMfaInSession } from '../lib/mfa';
import { mfaTotpVerifySchema } from '../schemas/mfa.schema';

type MfaActionErrorCode =
  | 'FORBIDDEN'
  | 'MFA_ALREADY_VERIFIED'
  | 'MFA_ENROLL_FAILED'
  | 'MFA_VERIFY_FAILED'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR';

type MfaActionError = {
  code: MfaActionErrorCode;
  fieldErrors?: Record<string, string[] | undefined>;
  message: string;
};

type MfaActionResult<T> = { data: T; ok: true } | { error: MfaActionError; ok: false };

function validationError(
  fieldErrors: Record<string, string[] | undefined>,
): MfaActionResult<never> {
  return {
    error: {
      code: 'VALIDATION_ERROR',
      fieldErrors,
      message: 'Please review the highlighted fields.',
    },
    ok: false,
  };
}

async function requireAdminLike(): Promise<MfaActionResult<{ userId: string }>> {
  const userResult = await getCurrentUserWithRole(['ADMIN', 'OWNER']);

  if (!userResult.ok) {
    return userResult.error === 'UNAUTHORIZED'
      ? {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required.',
          },
          ok: false,
        }
      : {
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required.',
          },
          ok: false,
        };
  }

  return {
    data: {
      userId: userResult.data.id,
    },
    ok: true,
  };
}

export async function startTotpEnrollmentAction(
  locale: SupportedLocale,
): Promise<
  MfaActionResult<{
    factorId: string;
    qrCode: string;
    secret?: string;
  }>
> {
  void locale;

  const admin = await requireAdminLike();
  if (!admin.ok) return admin;

  if (await hasVerifiedMfaInSession()) {
    return {
      error: {
        code: 'MFA_ALREADY_VERIFIED',
        message: 'Admin MFA is already verified in this session.',
      },
      ok: false,
    };
  }

  const existingFactorId = await getVerifiedTotpFactorId();
  if (existingFactorId) {
    return {
      error: {
        code: 'MFA_ALREADY_VERIFIED',
        message: 'Use your existing authenticator factor to verify this session.',
      },
      ok: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  });

  if (error) {
    return {
      error: {
        code: 'MFA_ENROLL_FAILED',
        message: 'Could not start MFA setup. Please try again.',
      },
      ok: false,
    };
  }

  return {
    data: {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    },
    ok: true,
  };
}

export async function verifyTotpEnrollmentAction(
  locale: SupportedLocale,
  rawInput: unknown,
): Promise<MfaActionResult<{ redirectTo: string }>> {
  const parsed = mfaTotpVerifySchema.safeParse(rawInput);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const admin = await requireAdminLike();
  if (!admin.ok) return admin;

  const supabase = await createSupabaseServerClient();
  const challenge = await supabase.auth.mfa.challenge({
    factorId: parsed.data.factorId,
  });

  if (challenge.error) {
    return {
      error: {
        code: 'MFA_VERIFY_FAILED',
        message: 'Could not start MFA verification. Please try again.',
      },
      ok: false,
    };
  }

  const verify = await supabase.auth.mfa.verify({
    challengeId: challenge.data.id,
    code: parsed.data.code,
    factorId: parsed.data.factorId,
  });

  if (verify.error) {
    return {
      error: {
        code: 'MFA_VERIFY_FAILED',
        message: 'The authenticator code could not be verified.',
      },
      ok: false,
    };
  }

  return {
    data: {
      redirectTo: localizeHref(locale, '/admin'),
    },
    ok: true,
  };
}
