'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { localizeHref, SUPPORTED_LOCALES } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { memberships } from '@/db/schema';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { createAuditLog } from '@/lib/audit';
import { isUndefinedTableError,MIGRATION_REQUIRED_MESSAGE } from '@/lib/db-guard';

import type { AdminActionResult } from '../lib/action-result';

const createSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  planCode: z.string().min(1, 'Plan code is required'),
  status: z.string().min(1, 'Status is required'),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().nullable().optional(),
});

function revalidateMembershipPages() {
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(localizeHref(locale, '/admin/memberships'));
  }
}

export async function createMembershipAction(rawInput: unknown): Promise<AdminActionResult<{ membershipId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };

  const parsed = createSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, code: 'validation', error: parsed.error.issues.map((i) => i.message).join('; ') };
  }

  const input = parsed.data;

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
    return { ok: false, code: 'conflict', error: 'Failed to create membership. The user ID may not exist or the value is invalid.' };
  }

  await createAuditLog({
    action: 'ADMIN_MEMBERSHIP_CREATED',
    actorUserId: admin.data.id,
    entityId: created.id,
    entityType: 'membership',
    payload: { userId: input.userId, planCode: input.planCode, status: input.status },
  });

  revalidateMembershipPages();
  return { ok: true, data: { membershipId: created.id } };
}

const updateSchema = z.object({
  membershipId: z.string().uuid('Invalid membership ID format'),
  planCode: z.string().min(1, 'Plan code is required'),
  status: z.string().min(1, 'Status is required'),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().nullable().optional(),
});

export async function updateMembershipAction(rawInput: unknown): Promise<AdminActionResult<{ membershipId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };

  const parsed = updateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, code: 'validation', error: parsed.error.issues.map((i) => i.message).join('; ') };
  }

  const input = parsed.data;

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
    return { ok: false, code: 'conflict', error: 'Failed to update membership.' };
  }

  if (!updated) return { ok: false, code: 'not_found', error: 'Membership not found.' };

  await createAuditLog({
    action: 'ADMIN_MEMBERSHIP_UPDATED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'membership',
    payload: { planCode: input.planCode, status: input.status },
  });

  revalidateMembershipPages();
  return { ok: true, data: { membershipId: updated.id } };
}

const deleteSchema = z.object({
  membershipId: z.string().uuid('Invalid membership ID format'),
});

export async function softDeleteMembershipAction(rawInput: unknown): Promise<AdminActionResult<{ membershipId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };

  const parsed = deleteSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, code: 'validation', error: parsed.error.issues.map((i) => i.message).join('; ') };
  }

  const { membershipId } = parsed.data;

  let updated: { id: string } | undefined;
  try {
    [updated] = await db
      .update(memberships)
      .set({ deletedAt: new Date(), status: 'INACTIVE', updatedAt: new Date() })
      .where(eq(memberships.id, membershipId))
      .returning({ id: memberships.id });
  } catch (error) {
    if (isUndefinedTableError(error, 'memberships')) {
      return { ok: false, code: 'conflict', error: MIGRATION_REQUIRED_MESSAGE };
    }
    return { ok: false, code: 'conflict', error: 'Failed to disable membership.' };
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
