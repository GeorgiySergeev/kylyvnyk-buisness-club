'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/db/client';
import { businesses } from '@/db/schema';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { createAuditLog } from '@/lib/audit';

import { updateBusinessStatusSchema } from '../schemas/admin.schema';

type ActionResult<T> = { data: T; ok: true } | { error: string; ok: false };

export async function updateBusinessStatusAction(rawInput: unknown): Promise<ActionResult<{ businessId: string; status: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { error: 'Unauthorized.', ok: false };

  const parsed = updateBusinessStatusSchema.safeParse(rawInput);
  if (!parsed.success) return { error: 'Invalid input.', ok: false };

  const [updated] = await db
    .update(businesses)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(businesses.id, parsed.data.businessId))
    .returning({ id: businesses.id, status: businesses.status });

  if (!updated) return { error: 'Business not found.', ok: false };

  await createAuditLog({
    action: 'ADMIN_BUSINESS_STATUS_UPDATED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'business',
    payload: { newStatus: parsed.data.status, targetBusinessId: updated.id },
  });

  revalidatePath('/en/admin/businesses');

  return { data: { businessId: updated.id, status: updated.status }, ok: true };
}
