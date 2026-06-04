'use server';

import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { auditLogs, profiles, users } from '@/db/schema';

import { requireUser } from '../lib/current-user';
import { onboardingSchema } from '../schemas/onboarding.schema';

type AppErrorCode = 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'SERVER_ERROR';

type AppError = {
  code: AppErrorCode;
  fieldErrors?: Record<string, string[] | undefined>;
  message: string;
};

type Result<T> = { data: T; ok: true } | { error: AppError; ok: false };

export async function completeOnboardingAction(
  locale: SupportedLocale,
  rawInput: unknown,
): Promise<Result<{ redirectTo: string }>> {
  const user = await requireUser(locale);
  const parsed = onboardingSchema.safeParse(rawInput);

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

  const now = new Date();

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          displayName: parsed.data.displayName,
          updatedAt: now,
        })
        .where(eq(users.id, user.id));

      await tx
        .insert(profiles)
        .values({
          bio: parsed.data.bio || null,
          cityId: parsed.data.cityId,
          countryId: parsed.data.countryId,
          onboardingSkippedAt: null,
          updatedAt: now,
          userId: user.id,
        })
        .onConflictDoUpdate({
          set: {
            bio: parsed.data.bio || null,
            cityId: parsed.data.cityId,
            countryId: parsed.data.countryId,
            onboardingSkippedAt: null,
            updatedAt: now,
          },
          target: profiles.userId,
        });

      await tx.insert(auditLogs).values({
        action: 'USER_ONBOARDING_COMPLETE',
        actorUserId: user.id,
        entityId: user.id,
        entityType: 'user',
        payload: {
          cityId: parsed.data.cityId ?? null,
          countryId: parsed.data.countryId ?? null,
        },
      });
    });
  } catch {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: 'Onboarding could not be completed. Please try again.',
      },
      ok: false,
    };
  }

  return {
    data: {
      redirectTo: localizeHref(locale, '/m/dashboard'),
    },
    ok: true,
  };
}

export async function completeOnboardingAndRedirect(locale: SupportedLocale, rawInput: unknown) {
  const result = await completeOnboardingAction(locale, rawInput);

  if (result.ok) {
    redirect(result.data.redirectTo);
  }

  return result;
}

export async function skipOnboardingAction(
  locale: SupportedLocale,
): Promise<Result<{ redirectTo: string }>> {
  const user = await requireUser(locale);
  const now = new Date();

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(profiles)
        .values({
          onboardingSkippedAt: now,
          updatedAt: now,
          userId: user.id,
        })
        .onConflictDoUpdate({
          set: {
            onboardingSkippedAt: now,
            updatedAt: now,
          },
          target: profiles.userId,
        });

      await tx.insert(auditLogs).values({
        action: 'USER_ONBOARDING_SKIPPED',
        actorUserId: user.id,
        entityId: user.id,
        entityType: 'user',
      });
    });
  } catch {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: 'Onboarding could not be skipped. Please try again.',
      },
      ok: false,
    };
  }

  return {
    data: {
      redirectTo: localizeHref(locale, '/m/dashboard?welcome=card-ready&tab=profile'),
    },
    ok: true,
  };
}
