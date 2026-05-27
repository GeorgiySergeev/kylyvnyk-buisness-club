'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { localizeHref, SUPPORTED_LOCALES } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { profiles, users } from '@/db/schema';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { createAuditLog } from '@/lib/audit';

import {
  restoreUserSchema,
  softDeleteUserSchema,
  updateUserDetailsSchema,
  updateUserProfileSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from '../schemas/admin.schema';

type ActionResult<T> = { data: T; ok: true } | { error: string; ok: false };

function revalidateUsersPages() {
  SUPPORTED_LOCALES.forEach((locale) => revalidatePath(localizeHref(locale, '/admin/users')));
}

export async function updateUserRoleAction(
  rawInput: unknown,
): Promise<ActionResult<{ userId: string; role: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');

  if (!admin.ok) {
    return { error: 'Unauthorized. Admin access required.', ok: false };
  }

  const parsed = updateUserRoleSchema.safeParse(rawInput);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors?.role?.[0] ?? 'Invalid input.', ok: false };
  }

  const now = new Date();

  const [updated] = await db
    .update(users)
    .set({ role: parsed.data.role, updatedAt: now })
    .where(eq(users.id, parsed.data.userId))
    .returning({ id: users.id, role: users.role });

  if (!updated) {
    return { error: 'User not found.', ok: false };
  }

  await createAuditLog({
    action: 'ADMIN_USER_ROLE_UPDATED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'user',
    payload: { newRole: parsed.data.role, targetUserId: updated.id },
  });

  revalidateUsersPages();

  return { data: { userId: updated.id, role: updated.role }, ok: true };
}

export async function updateUserStatusAction(
  rawInput: unknown,
): Promise<ActionResult<{ userId: string; status: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');

  if (!admin.ok) {
    return { error: 'Unauthorized. Admin access required.', ok: false };
  }

  const parsed = updateUserStatusSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors?.status?.[0] ?? 'Invalid input.',
      ok: false,
    };
  }

  if (admin.data.id === parsed.data.userId && parsed.data.status !== 'ACTIVE') {
    return { error: 'You cannot block or deactivate your own account.', ok: false };
  }

  const now = new Date();

  const [updated] = await db
    .update(users)
    .set({ status: parsed.data.status, updatedAt: now })
    .where(eq(users.id, parsed.data.userId))
    .returning({ id: users.id, status: users.status });

  if (!updated) {
    return { error: 'User not found.', ok: false };
  }

  await createAuditLog({
    action: parsed.data.status === 'BANNED' ? 'ADMIN_USER_BANNED' : 'ADMIN_USER_STATUS_UPDATED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'user',
    payload: { newStatus: parsed.data.status, targetUserId: updated.id },
  });

  revalidateUsersPages();

  return { data: { userId: updated.id, status: updated.status }, ok: true };
}

export async function updateUserDetailsAction(
  rawInput: unknown,
): Promise<ActionResult<{ userId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { error: 'Unauthorized. Admin access required.', ok: false };

  const parsed = updateUserDetailsSchema.safeParse(rawInput);
  if (!parsed.success) return { error: 'Invalid input.', ok: false };

  try {
    const [updated] = await db
      .update(users)
      .set({
        displayName: parsed.data.displayName ?? null,
        email: parsed.data.email ?? null,
        phone: parsed.data.phone,
        supabaseUserId: parsed.data.supabaseUserId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, parsed.data.userId))
      .returning({ id: users.id });

    if (!updated) return { error: 'User not found.', ok: false };

    await createAuditLog({
      action: 'ADMIN_USER_UPDATED',
      actorUserId: admin.data.id,
      entityId: updated.id,
      entityType: 'user',
      payload: parsed.data,
    });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === '23505') return { error: 'Phone, email, or Supabase user id already exists.', ok: false };
    throw error;
  }

  revalidateUsersPages();
  return { data: { userId: parsed.data.userId }, ok: true };
}

export async function updateUserProfileAction(
  rawInput: unknown,
): Promise<ActionResult<{ userId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { error: 'Unauthorized. Admin access required.', ok: false };

  const parsed = updateUserProfileSchema.safeParse(rawInput);
  if (!parsed.success) return { error: 'Invalid input.', ok: false };

  const existing = await db.query.profiles.findFirst({
    columns: { id: true },
    where: (p, { eq }) => eq(p.userId, parsed.data.userId),
  });

  if (existing) {
    await db
      .update(profiles)
      .set({
        avatarUrl: parsed.data.avatarUrl ?? null,
        bio: parsed.data.bio ?? null,
        cityId: parsed.data.cityId ?? null,
        countryId: parsed.data.countryId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, parsed.data.userId));
  } else {
    await db.insert(profiles).values({
      avatarUrl: parsed.data.avatarUrl ?? null,
      bio: parsed.data.bio ?? null,
      cityId: parsed.data.cityId ?? null,
      countryId: parsed.data.countryId ?? null,
      userId: parsed.data.userId,
    });
  }

  await createAuditLog({
    action: 'ADMIN_USER_PROFILE_UPDATED',
    actorUserId: admin.data.id,
    entityId: parsed.data.userId,
    entityType: 'profile',
    payload: parsed.data,
  });

  revalidateUsersPages();
  return { data: { userId: parsed.data.userId }, ok: true };
}

export async function softDeleteUserAction(
  rawInput: unknown,
): Promise<ActionResult<{ userId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { error: 'Unauthorized. Admin access required.', ok: false };
  const parsed = softDeleteUserSchema.safeParse(rawInput);
  if (!parsed.success) return { error: 'Invalid input.', ok: false };

  if (admin.data.id === parsed.data.userId) {
    return { error: 'You cannot delete your own account.', ok: false };
  }

  const [updated] = await db
    .update(users)
    .set({ deletedAt: new Date(), status: 'INACTIVE', updatedAt: new Date() })
    .where(eq(users.id, parsed.data.userId))
    .returning({ id: users.id });

  if (!updated) return { error: 'User not found.', ok: false };

  await createAuditLog({
    action: 'ADMIN_USER_SOFT_DELETED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'user',
  });

  revalidateUsersPages();
  return { data: { userId: updated.id }, ok: true };
}

export async function restoreUserAction(
  rawInput: unknown,
): Promise<ActionResult<{ userId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { error: 'Unauthorized. Admin access required.', ok: false };
  const parsed = restoreUserSchema.safeParse(rawInput);
  if (!parsed.success) return { error: 'Invalid input.', ok: false };

  const [updated] = await db
    .update(users)
    .set({ deletedAt: null, status: 'ACTIVE', updatedAt: new Date() })
    .where(eq(users.id, parsed.data.userId))
    .returning({ id: users.id });

  if (!updated) return { error: 'User not found.', ok: false };

  await createAuditLog({
    action: 'ADMIN_USER_RESTORED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'user',
  });

  revalidateUsersPages();
  return { data: { userId: updated.id }, ok: true };
}
