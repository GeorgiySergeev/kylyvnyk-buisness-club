'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { businesses, introductions } from '@/db/schema';
import { guardOnboarded } from '@/features/auth/lib/role-guards';
import { userHasActiveVipMembership } from '@/features/billing/lib/membership-lifecycle';
import { createAuditLog } from '@/lib/audit';

import { introductionRequestSchema } from '../schemas/introduction.schema';

type AppErrorCode = 'FORBIDDEN' | 'VALIDATION_ERROR' | 'SERVER_ERROR';

type AppError = {
  code: AppErrorCode;
  fieldErrors?: Record<string, string[] | undefined>;
  message: string;
};

type Result<T> = { data: T; ok: true } | { error: AppError; ok: false };

export async function submitIntroductionAction(
  locale: SupportedLocale,
  rawInput: unknown,
): Promise<Result<{ introductionId: string }>> {
  const user = await guardOnboarded(locale);

  if (!(await userHasActiveVipMembership(user.id))) {
    return {
      error: {
        code: 'FORBIDDEN',
        message: 'VIP membership is required to submit a Business Introduction.',
      },
      ok: false,
    };
  }

  const parsed = introductionRequestSchema.safeParse(rawInput);

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

  const targetBusiness = await db.query.businesses.findFirst({
    columns: {
      id: true,
    },
    where: and(
      eq(businesses.id, parsed.data.targetBusinessId),
      eq(businesses.status, 'PUBLISHED'),
      isNull(businesses.deletedAt),
    ),
  });

  if (!targetBusiness) {
    return {
      error: {
        code: 'FORBIDDEN',
        fieldErrors: {
          targetBusinessId: ['Select a published business.'],
        },
        message: 'This business is not available for requests.',
      },
      ok: false,
    };
  }

  try {
    const [created] = await db
      .insert(introductions)
      .values({
        clientContact: parsed.data.clientContact,
        clientName: parsed.data.clientName,
        message: parsed.data.message ?? null,
        requesterId: user.id,
        status: 'SUBMITTED',
        targetBusinessId: targetBusiness.id,
      })
      .returning({ id: introductions.id });

    if (!created) {
      throw new Error('Introduction insert did not return an id.');
    }

    await createAuditLog({
      action: 'INTRODUCTION_SUBMITTED',
      actorUserId: user.id,
      entityId: created.id,
      entityType: 'introduction',
      payload: {
        targetBusinessId: targetBusiness.id,
      },
    });

    revalidatePath(localizeHref(locale, '/m/dashboard'));
    revalidatePath(localizeHref(locale, '/m/introduce'));

    return {
      data: {
        introductionId: created.id,
      },
      ok: true,
    };
  } catch {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: 'The request could not be submitted. Please try again.',
      },
      ok: false,
    };
  }
}
