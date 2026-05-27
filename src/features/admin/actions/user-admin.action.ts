'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import {
  SUPPORTED_LOCALES,
  localizeHref,
  type SupportedLocale,
} from '@/components/layout/navigation';
import { db } from '@/db/client';
import { memberships, profiles, users } from '@/db/schema';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { createAuditLog } from '@/lib/audit';
import { log } from '@/lib/log';

import {
  restoreUserSchema,
  softDeleteUserSchema,
  updateUserDetailsSchema,
  updateUserMembershipSchema,
  updateUserProfileSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from '../schemas/admin.schema';

type ActionResult<T> = { data: T; ok: true } | { error: string; ok: false };

function revalidateUsersPages(userId?: string, locale?: SupportedLocale) {
  const locales = locale ? [locale] : SUPPORTED_LOCALES;
  locales.forEach((item) => {
    revalidatePath(localizeHref(item, '/admin/users'));
    if (userId) {
      revalidatePath(localizeHref(item, `/admin/users/${userId}`));
    }
  });
}

export async function updateUserRoleAction(
  rawInput: unknown,
  locale: SupportedLocale,
): Promise<ActionResult<{ userId: string; role: string }>> {
  const start = Date.now();
  const admin = await getCurrentUserWithRole('ADMIN');

  if (!admin.ok) {
    log.warn('Admin user role update denied', { reason: admin.error });
    return { error: 'Unauthorized. Admin access required.', ok: false };
  }

  const parsed = updateUserRoleSchema.safeParse(rawInput);

  if (!parsed.success) {
    log.warn('Admin user role update validation failed', {
      userId: admin.data.id,
    });
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

  revalidateUsersPages(parsed.data.userId, locale);
  log.info('Admin user role updated', {
    durationMs: Date.now() - start,
    targetUserId: updated.id,
  });

  return { data: { userId: updated.id, role: updated.role }, ok: true };
}

export async function updateUserMembershipAction(
  rawInput: unknown,
  locale: SupportedLocale,
): Promise<ActionResult<{ userId: string; membershipTier: string }>> {
  const start = Date.now();
  const admin = await getCurrentUserWithRole('ADMIN');

  if (!admin.ok) {
    log.warn('Admin user membership update denied', { reason: admin.error });
    return { error: 'Unauthorized. Admin access required.', ok: false };
  }

  const parsed = updateUserMembershipSchema.safeParse(rawInput);

  if (!parsed.success) {
    log.warn('Admin user membership update validation failed', {
      userId: admin.data.id,
    });
    return { error: 'Invalid input.', ok: false };
  }

  const now = new Date();

  const existingMembership = await db.query.memberships.findFirst({
    where: (m, { and, eq: eqOp }) =>
      and(eqOp(m.userId, parsed.data.userId), eqOp(m.status, 'ACTIVE')),
  });

  if (existingMembership) {
    await db
      .update(memberships)
      .set({ planCode: parsed.data.membershipTier, updatedAt: now })
      .where(eq(memberships.id, existingMembership.id));
  } else {
    await db.insert(memberships).values({
      userId: parsed.data.userId,
      planCode: parsed.data.membershipTier,
      status: 'ACTIVE',
      startsAt: now,
    });
  }

  await createAuditLog({
    action: 'ADMIN_USER_MEMBERSHIP_UPDATED',
    actorUserId: admin.data.id,
    entityId: parsed.data.userId,
    entityType: 'user',
    payload: { newTier: parsed.data.membershipTier, targetUserId: parsed.data.userId },
  });

  revalidateUsersPages(parsed.data.userId, locale);
  log.info('Admin user membership updated', {
    durationMs: Date.now() - start,
    targetUserId: parsed.data.userId,
  });

  return {
    data: { userId: parsed.data.userId, membershipTier: parsed.data.membershipTier },
    ok: true,
  };
}

export async function updateUserStatusAction(
  rawInput: unknown,
  locale: SupportedLocale,
): Promise<ActionResult<{ userId: string; status: string }>> {
  const start = Date.now();
  const admin = await getCurrentUserWithRole('ADMIN');

  if (!admin.ok) {
    log.warn('Admin user status update denied', { reason: admin.error });
    return { error: 'Unauthorized. Admin access required.', ok: false };
  }

  const parsed = updateUserStatusSchema.safeParse(rawInput);

  if (!parsed.success) {
    log.warn('Admin user status update validation failed', {
      userId: admin.data.id,
    });
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

  revalidateUsersPages(parsed.data.userId, locale);
  log.info('Admin user status updated', {
    durationMs: Date.now() - start,
    targetUserId: updated.id,
  });

  return { data: { userId: updated.id, status: updated.status }, ok: true };
}

export async function updateUserDetailsAction(
  rawInput: unknown,
): Promise<ActionResult<{ userId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { error: 'Unauthorized. Admin access required.', ok: false };

  const parsed = updateUserDetailsSchema.safeParse(rawInput);
  if (!parsed.success) return { error: 'Invalid input.', ok: false };

  const { userId, ...fields } = parsed.data;

  // Build partial update — only set fields that were explicitly provided
  const setPayload: Record<string, unknown> = { updatedAt: new Date() };
  if ('displayName' in fields) setPayload.displayName = fields.displayName ?? null;
  if ('email' in fields) setPayload.email = fields.email ?? null;
  if ('phone' in fields) setPayload.phone = fields.phone;
  if ('supabaseUserId' in fields) setPayload.supabaseUserId = fields.supabaseUserId ?? null;

  try {
    const [updated] = await db
      .update(users)
      .set(setPayload)
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!updated) return { error: 'User not found.', ok: false };

    await createAuditLog({
      action: 'ADMIN_USER_UPDATED',
      actorUserId: admin.data.id,
      entityId: updated.id,
      entityType: 'user',
      payload: fields,
    });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === '23505')
      return { error: 'Phone, email, or Supabase user id already exists.', ok: false };
    throw error;
  }

  revalidateUsersPages(userId);
  return { data: { userId }, ok: true };
}

export async function updateUserProfileAction(
  rawInput: unknown,
): Promise<ActionResult<{ userId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { error: 'Unauthorized. Admin access required.', ok: false };

  const parsed = updateUserProfileSchema.safeParse(rawInput);
  if (!parsed.success) return { error: 'Invalid input.', ok: false };

  const { userId, ...fields } = parsed.data;

  // Build partial update — only set fields that were explicitly provided
  const setPayload: Record<string, unknown> = { updatedAt: new Date() };
  if ('avatarUrl' in fields) setPayload.avatarUrl = fields.avatarUrl ?? null;
  if ('bio' in fields) setPayload.bio = fields.bio ?? null;
  if ('cityId' in fields) setPayload.cityId = fields.cityId ?? null;
  if ('countryId' in fields) setPayload.countryId = fields.countryId ?? null;

  const existing = await db.query.profiles.findFirst({
    columns: { id: true },
    where: (p, { eq }) => eq(p.userId, userId),
  });

  if (existing) {
    await db
      .update(profiles)
      .set(setPayload)
      .where(eq(profiles.userId, userId));
  } else {
    await db.insert(profiles).values({
      avatarUrl: fields.avatarUrl ?? null,
      bio: fields.bio ?? null,
      cityId: fields.cityId ?? null,
      countryId: fields.countryId ?? null,
      userId,
    });
  }

  await createAuditLog({
    action: 'ADMIN_USER_PROFILE_UPDATED',
    actorUserId: admin.data.id,
    entityId: userId,
    entityType: 'profile',
    payload: fields,
  });

  revalidateUsersPages(userId);
  return { data: { userId }, ok: true };
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

  revalidateUsersPages(parsed.data.userId);
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

  revalidateUsersPages(parsed.data.userId);
  return { data: { userId: updated.id }, ok: true };
}
