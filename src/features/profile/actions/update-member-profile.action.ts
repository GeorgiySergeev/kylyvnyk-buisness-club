'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref, SUPPORTED_LOCALES } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { profiles, users } from '@/db/schema';
import { getAuthIdentity } from '@/features/auth/lib/auth-identity';
import { requireUser } from '@/features/auth/lib/current-user';
import { createAuditLog } from '@/lib/audit';
import { createSupabaseServerClient } from '@/lib/supabase/server';

import { AvatarUploadError, uploadMemberAvatar } from '../lib/upload-member-avatar';
import { parseMemberProfileFormData } from '../schemas/member-profile.schema';

type AppErrorCode =
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'EMAIL_IN_USE'
  | 'AVATAR_DEV_BYPASS'
  | 'AVATAR_ERROR';

type AppError = {
  code: AppErrorCode;
  fieldErrors?: Record<string, string[] | undefined>;
  message: string;
};

type Result<T> = { data: T; ok: true } | { error: AppError; ok: false };

function revalidateMemberProfilePaths(locale: SupportedLocale) {
  revalidatePath(localizeHref(locale, '/admin/profile'));
  revalidatePath(localizeHref(locale, '/m/dashboard'));
  SUPPORTED_LOCALES.forEach((item) => {
    revalidatePath(`/${item}`, 'layout');
  });
}

function avatarErrorMessage(error: AvatarUploadError): AppError {
  const messages: Record<AvatarUploadError['code'], string> = {
    FILE_TOO_LARGE: 'Avatar must be 2 MB or smaller.',
    INVALID_FILE_TYPE: 'Avatar must be a JPEG, PNG, or WebP image.',
    MISSING_SUPABASE_USER: 'Your account cannot upload photos yet. Sign in again.',
    STORAGE_ERROR: 'Avatar upload failed. Check storage setup or try again.',
  };

  return {
    code: 'AVATAR_ERROR',
    message: messages[error.code],
  };
}

export async function updateMemberProfileAction(
  locale: SupportedLocale,
  formData: FormData,
): Promise<Result<{ ok: true }>> {
  const user = await requireUser(locale);
  const parsed = parseMemberProfileFormData(formData);

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

  const avatarFile = formData.get('avatar');
  let nextAvatarUrl: string | null | undefined;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    const identity = await getAuthIdentity();

    if (identity?.devBypass) {
      return {
        error: {
          code: 'AVATAR_DEV_BYPASS',
          message:
            'Photo upload requires SMS sign-in. Dev bypass cannot write to Supabase Storage.',
        },
        ok: false,
      };
    }

    if (!user.supabaseUserId) {
      return {
        error: {
          code: 'AVATAR_ERROR',
          message: 'Your account cannot upload photos yet. Sign in again.',
        },
        ok: false,
      };
    }

    try {
      const supabase = await createSupabaseServerClient();
      nextAvatarUrl = await uploadMemberAvatar(supabase, user.supabaseUserId, avatarFile);
    } catch (error) {
      if (error instanceof AvatarUploadError) {
        return { error: avatarErrorMessage(error), ok: false };
      }
      return {
        error: {
          code: 'SERVER_ERROR',
          message: 'Avatar upload failed. Please try again.',
        },
        ok: false,
      };
    }
  }

  const now = new Date();
  const { bio, cityId, countryId, displayName, email } = parsed.data;

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          displayName,
          email,
          updatedAt: now,
        })
        .where(eq(users.id, user.id));

      const profileSet: {
        avatarUrl?: string | null;
        bio: string | null;
        cityId: number | null | undefined;
        countryId: number | null | undefined;
        updatedAt: Date;
      } = {
        bio: bio ?? null,
        cityId: cityId ?? null,
        countryId: countryId ?? null,
        updatedAt: now,
      };

      if (nextAvatarUrl !== undefined) {
        profileSet.avatarUrl = nextAvatarUrl;
      }

      await tx
        .insert(profiles)
        .values({
          avatarUrl: nextAvatarUrl ?? null,
          bio: profileSet.bio,
          cityId: profileSet.cityId ?? null,
          countryId: profileSet.countryId ?? null,
          updatedAt: now,
          userId: user.id,
        })
        .onConflictDoUpdate({
          set: profileSet,
          target: profiles.userId,
        });
    });

    await createAuditLog({
      action: 'USER_PROFILE_UPDATED',
      actorUserId: user.id,
      entityId: user.id,
      entityType: 'user',
      payload: {
        cityId: cityId ?? null,
        countryId: countryId ?? null,
        hasAvatarUpload: nextAvatarUrl !== undefined,
      },
    });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === '23505') {
      return {
        error: {
          code: 'EMAIL_IN_USE',
          message: 'Email already in use.',
        },
        ok: false,
      };
    }

    return {
      error: {
        code: 'SERVER_ERROR',
        message: 'Profile could not be saved. Please try again.',
      },
      ok: false,
    };
  }

  revalidateMemberProfilePaths(locale);

  return { data: { ok: true }, ok: true };
}
