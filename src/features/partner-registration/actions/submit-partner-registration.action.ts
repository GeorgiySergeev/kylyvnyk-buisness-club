'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { headers } from 'next/headers';

import type { SupportedLocale } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { businessApplications } from '@/db/schema';
import { getCurrentUser } from '@/features/auth/lib/current-user';
import { createPartnerRegistrationSchema } from '@/features/partner-registration/schemas/partner-registration.schema';
import { createAuditLog } from '@/lib/audit';
import { verifyTurnstileToken } from '@/lib/captcha/turnstile';
import { getT } from '@/lib/i18n/t-server';
import { checkPartnerRegistrationRateLimit } from '@/lib/rate-limit/upstash';

type PartnerRegistrationErrorCode =
  | 'CAPTCHA_FAILED'
  | 'DUPLICATE_SUBMISSION'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'VALIDATION_ERROR';

type PartnerRegistrationError = {
  code: PartnerRegistrationErrorCode;
  fieldErrors?: Record<string, string[] | undefined>;
  message: string;
};

type PartnerRegistrationResult<T> =
  | { data: T; ok: true }
  | { error: PartnerRegistrationError; ok: false };

function getValidationMessages(locale: SupportedLocale) {
  const t = getT('partnerRegistration', locale);

  return {
    acceptLegalRequired: t('errorAcceptLegal'),
    businessNameRequired: t('errorBusinessName'),
    categoryRequired: t('errorCategory'),
    cityRequired: t('errorCity'),
    confirmAuthorityRequired: t('errorConfirmAuthority'),
    countryRequired: t('errorCountry'),
    emailInvalid: t('errorEmail'),
    phoneRequired: t('errorPhone'),
    representativeNameRequired: t('errorRepresentativeName'),
    websiteRequired: t('errorWebsite'),
  };
}

function getRequestIp(headerList: Headers) {
  return headerList.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
}

export async function submitPartnerRegistrationAction(
  locale: SupportedLocale,
  rawInput: unknown,
): Promise<PartnerRegistrationResult<{ applicationId: string; status: 'UNDER_REVIEW' }>> {
  const t = getT('partnerRegistration', locale);
  const schema = createPartnerRegistrationSchema(getValidationMessages(locale));
  const parsed = schema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: {
        code: 'VALIDATION_ERROR',
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: t('formError'),
      },
      ok: false,
    };
  }

  const headerList = await headers();
  const ip = getRequestIp(headerList);
  const rateLimit = await checkPartnerRegistrationRateLimit(`${ip}:${parsed.data.email.toLowerCase()}`);

  if (!rateLimit.success) {
    return {
      error: {
        code: 'RATE_LIMITED',
        message: t('rateLimitError'),
      },
      ok: false,
    };
  }

  const captchaValid = await verifyTurnstileToken(parsed.data.captchaToken || '', ip);

  if (!captchaValid) {
    return {
      error: {
        code: 'CAPTCHA_FAILED',
        message: t('captchaError'),
      },
      ok: false,
    };
  }

  const existingApplication = await db.query.businessApplications.findFirst({
    columns: { id: true },
    where: and(
      eq(businessApplications.businessName, parsed.data.businessName),
      eq(businessApplications.email, parsed.data.email),
      isNull(businessApplications.deletedAt),
    ),
  });

  if (existingApplication) {
    return {
      error: {
        code: 'DUPLICATE_SUBMISSION',
        message: t('duplicateError'),
      },
      ok: false,
    };
  }

  const user = await getCurrentUser();
  const now = new Date();

  try {
    const [created] = await db
      .insert(businessApplications)
      .values({
        acceptLegal: parsed.data.acceptLegal,
        businessName: parsed.data.businessName,
        categoryId: parsed.data.categoryId,
        cityName: parsed.data.cityName,
        confirmAuthority: parsed.data.confirmAuthority,
        countryId: parsed.data.countryId,
        email: parsed.data.email,
        phone: parsed.data.phone,
        representativeName: parsed.data.representativeName,
        status: 'UNDER_REVIEW',
        updatedAt: now,
        userId: user?.id ?? null,
        websiteOrSocial: parsed.data.websiteOrSocial,
      })
      .returning({ id: businessApplications.id });

    if (!created) {
      throw new Error('Business application insert returned no row.');
    }

    await createAuditLog({
      action: 'BUSINESS_APPLICATION_SUBMITTED',
      actorUserId: user?.id ?? null,
      entityId: created.id,
      entityType: 'business_application',
      ipAddress: ip,
      payload: {
        categoryId: parsed.data.categoryId,
        countryId: parsed.data.countryId,
        status: 'UNDER_REVIEW',
      },
    });

    return {
      data: { applicationId: created.id, status: 'UNDER_REVIEW' },
      ok: true,
    };
  } catch {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: t('serverError'),
      },
      ok: false,
    };
  }
}
