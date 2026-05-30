'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { auditLogs, businesses } from '@/db/schema';
import { guardOnboarded } from '@/features/auth/lib/role-guards';
import { userHasActiveVipMembership } from '@/features/billing/lib/membership-lifecycle';
import { generateUniqueBusinessSlug } from '@/features/business/lib/business-slug';
import { submitBusinessSchema } from '@/features/business/schemas/submit-business.schema';

type SubmitBusinessErrorCode =
  | 'ALREADY_SUBMITTED'
  | 'SERVER_ERROR'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR';

type SubmitBusinessError = {
  code: SubmitBusinessErrorCode;
  fieldErrors?: Record<string, string[] | undefined>;
  message: string;
};

type SubmitBusinessResult<T> = { data: T; ok: true } | { error: SubmitBusinessError; ok: false };

export async function submitBusinessAction(
  locale: SupportedLocale,
  rawInput: unknown,
): Promise<SubmitBusinessResult<{ businessId: string; redirectTo: string }>> {
  const user = await guardOnboarded(locale);

  if (!(await userHasActiveVipMembership(user.id))) {
    return {
      error: {
        code: 'UNAUTHORIZED',
        message: 'VIP membership is required to submit a business profile.',
      },
      ok: false,
    };
  }

  const parsed = submitBusinessSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: {
        code: 'VALIDATION_ERROR',
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: 'Please review the highlighted fields.',
      },
      ok: false,
    };
  }

  const existingBusiness = await db.query.businesses.findFirst({
    columns: { id: true },
    where: and(eq(businesses.userId, user.id), isNull(businesses.deletedAt)),
  });

  if (existingBusiness) {
    return {
      error: {
        code: 'ALREADY_SUBMITTED',
        message: 'You already have a business profile on file.',
      },
      ok: false,
    };
  }

  const slug = await generateUniqueBusinessSlug(parsed.data.name);
  const now = new Date();

  try {
    const [created] = await db
      .insert(businesses)
      .values({
        categoryId: parsed.data.categoryId,
        cityId: parsed.data.cityId,
        countryId: parsed.data.countryId,
        description: parsed.data.description || null,
        email: parsed.data.email,
        name: parsed.data.name,
        phone: parsed.data.phone,
        slug,
        status: 'PENDING',
        updatedAt: now,
        userId: user.id,
        website: parsed.data.website ?? null,
      })
      .returning({ id: businesses.id });

    if (!created) {
      throw new Error('Business insert returned no row.');
    }

    await db.insert(auditLogs).values({
      action: 'BUSINESS_SUBMITTED',
      actorUserId: user.id,
      entityId: created.id,
      entityType: 'business',
      payload: {
        representativeName: parsed.data.representativeName,
        slug,
        status: 'PENDING',
      },
    });

    return {
      data: {
        businessId: created.id,
        redirectTo: localizeHref(locale, '/m/dashboard'),
      },
      ok: true,
    };
  } catch {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: 'Business profile could not be submitted. Please try again.',
      },
      ok: false,
    };
  }
}

export async function submitBusinessAndRedirect(locale: SupportedLocale, rawInput: unknown) {
  const result = await submitBusinessAction(locale, rawInput);

  if (result.ok) {
    redirect(result.data.redirectTo);
  }

  return result;
}
