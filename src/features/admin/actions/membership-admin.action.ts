'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { localizeHref, SUPPORTED_LOCALES } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { memberships } from '@/db/schema';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { createAuditLog } from '@/lib/audit';
import { MIGRATION_REQUIRED_MESSAGE, isUndefinedTableError } from '@/lib/db-guard';

import type { AdminActionResult } from '../lib/action-result';

function revalidateMembershipPages() {
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(localizeHref(locale, '/admin/memberships'));
  }
}

export async function createMembershipAction(rawInput: unknown): Promise<AdminActionResult<{ membershipId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };

  const input = rawInput as {
    userId?: string;
    planCode?: string;
    status?: string;
    startsAt?: Date | null;
    endsAt?: Date | null;
  };

  if (!input.userId || !input.planCode || !input.status) {
    return { ok: false, code: 'validation', error: 'Invalid input.' };
  }

  let created: { id: string };
  try {
    [created] = await db
      .insert(memberships)
      .values({
        endsAt: input.endsAt ?? null,
        planCode: input.planCode,
        startsAt: input.startsAt ?? new Date(),
        status: input.status,
        userId: input.userId,
      })
      .returning({ id: memberships.id });
  } catch (error) {
    if (isUndefinedTableError(error, 'memberships')) {
      return { ok: false, code: 'conflict', error: MIGRATION_REQUIRED_MESSAGE };
    }
    throw error;
  }

  await createAuditLog({
    action: 'ADMIN_MEMBERSHIP_CREATED',
    actorUserId: admin.data.id,
    entityId: created.id,
    entityType: 'membership',
    payload: input,
  });

  revalidateMembershipPages();
  return { ok: true, data: { membershipId: created.id } };
}

export async function updateMembershipAction(rawInput: unknown): Promise<AdminActionResult<{ membershipId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };

  const input = rawInput as {
    membershipId?: string;
    planCode?: string;
    status?: string;
    startsAt?: Date | null;
    endsAt?: Date | null;
  };

  if (!input.membershipId || !input.planCode || !input.status) {
    return { ok: false, code: 'validation', error: 'Invalid input.' };
  }

  let updated: { id: string } | undefined;
  try {
    [updated] = await db
      .update(memberships)
      .set({
        endsAt: input.endsAt ?? null,
        planCode: input.planCode,
        startsAt: input.startsAt ?? new Date(),
        status: input.status,
        updatedAt: new Date(),
      })
      .where(eq(memberships.id, input.membershipId))
      .returning({ id: memberships.id });
  } catch (error) {
    if (isUndefinedTableError(error, 'memberships')) {
      return { ok: false, code: 'conflict', error: MIGRATION_REQUIRED_MESSAGE };
    }
    throw error;
  }

  if (!updated) return { ok: false, code: 'not_found', error: 'Membership not found.' };

  await createAuditLog({
    action: 'ADMIN_MEMBERSHIP_UPDATED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'membership',
    payload: input,
  });

  revalidateMembershipPages();
  return { ok: true, data: { membershipId: updated.id } };
}

export async function softDeleteMembershipAction(rawInput: unknown): Promise<AdminActionResult<{ membershipId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };

  const input = rawInput as { membershipId?: string };
  if (!input.membershipId) return { ok: false, code: 'validation', error: 'Invalid input.' };

  let updated: { id: string } | undefined;
  try {
    [updated] = await db
      .update(memberships)
      .set({ deletedAt: new Date(), status: 'INACTIVE', updatedAt: new Date() })
      .where(eq(memberships.id, input.membershipId))
      .returning({ id: memberships.id });
  } catch (error) {
    if (isUndefinedTableError(error, 'memberships')) {
      return { ok: false, code: 'conflict', error: MIGRATION_REQUIRED_MESSAGE };
    }
    throw error;
  }

  if (!updated) return { ok: false, code: 'not_found', error: 'Membership not found.' };

  await createAuditLog({
    action: 'ADMIN_MEMBERSHIP_SOFT_DELETED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'membership',
  });

  revalidateMembershipPages();
  return { ok: true, data: { membershipId: updated.id } };
}
