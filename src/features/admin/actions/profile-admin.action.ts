'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { localizeHref, SUPPORTED_LOCALES } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { profiles } from '@/db/schema';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { createAuditLog } from '@/lib/audit';

import type { AdminActionResult } from '../lib/action-result';
import { updateProfileSchema } from '../schemas/admin.schema';

function revalidateUsersPages() {
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(localizeHref(locale, '/admin/users'));
  }
}

export async function updateProfileAction(rawInput: unknown): Promise<AdminActionResult<{ profileId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = updateProfileSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };

  const { profileId, ...update } = parsed.data;
  const [updated] = await db
    .update(profiles)
    .set({ ...update, updatedAt: new Date() })
    .where(eq(profiles.id, profileId))
    .returning({ id: profiles.id });
  if (!updated) return { ok: false, code: 'not_found', error: 'Profile not found.' };

  await createAuditLog({
    action: 'ADMIN_PROFILE_UPDATED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'profile',
    payload: update,
  });
  revalidateUsersPages();
  return { ok: true, data: { profileId: updated.id } };
}
