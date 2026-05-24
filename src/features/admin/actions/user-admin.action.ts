'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/db/client';
import { users } from '@/db/schema';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { createAuditLog } from '@/lib/audit';

import { updateUserRoleSchema, updateUserStatusSchema } from '../schemas/admin.schema';

type ActionResult<T> = { data: T; ok: true } | { error: string; ok: false };

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

  revalidatePath('/en/admin/users');

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

  revalidatePath('/en/admin/users');

  return { data: { userId: updated.id, status: updated.status }, ok: true };
}
