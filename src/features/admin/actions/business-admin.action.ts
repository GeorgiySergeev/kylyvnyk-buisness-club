'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { localizeHref, SUPPORTED_LOCALES } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { businesses } from '@/db/schema';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { createAuditLog } from '@/lib/audit';

import type { AdminActionResult } from '../lib/action-result';
import { updateBusinessStatusSchema } from '../schemas/admin.schema';
import {
  restoreBusinessSchema,
  softDeleteBusinessSchema,
  toggleBusinessFeatureSchema,
} from '../schemas/admin.schema';

type ActionResult<T> = { data: T; ok: true } | { error: string; ok: false };

function revalidateBusinessesPages() {
  SUPPORTED_LOCALES.forEach((locale) => revalidatePath(localizeHref(locale, '/admin/businesses')));
}

export async function updateBusinessStatusAction(
  rawInput: unknown,
): Promise<ActionResult<{ businessId: string; status: string }>> {
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

  revalidateBusinessesPages();

  return { data: { businessId: updated.id, status: updated.status }, ok: true };
}

export async function toggleBusinessFeatureAction(
  rawInput: unknown,
): Promise<AdminActionResult<{ businessId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = toggleBusinessFeatureSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };

  const [updated] = await db
    .update(businesses)
    .set({
      isRecommended: parsed.data.isRecommended,
      isTopPartner: parsed.data.isTopPartner,
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, parsed.data.businessId))
    .returning({ id: businesses.id });

  if (!updated) return { ok: false, code: 'not_found', error: 'Business not found.' };

  await createAuditLog({
    action: 'ADMIN_BUSINESS_FLAGS_UPDATED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'business',
    payload: { isRecommended: parsed.data.isRecommended, isTopPartner: parsed.data.isTopPartner },
  });
  revalidateBusinessesPages();
  return { ok: true, data: { businessId: updated.id } };
}

export async function softDeleteBusinessAction(
  rawInput: unknown,
): Promise<AdminActionResult<{ businessId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = softDeleteBusinessSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };

  const [updated] = await db
    .update(businesses)
    .set({ deletedAt: new Date(), status: 'HIDDEN', updatedAt: new Date() })
    .where(eq(businesses.id, parsed.data.businessId))
    .returning({ id: businesses.id });
  if (!updated) return { ok: false, code: 'not_found', error: 'Business not found.' };

  await createAuditLog({
    action: 'ADMIN_BUSINESS_SOFT_DELETED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'business',
  });
  revalidateBusinessesPages();
  return { ok: true, data: { businessId: updated.id } };
}

export async function restoreBusinessAction(
  rawInput: unknown,
): Promise<AdminActionResult<{ businessId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = restoreBusinessSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };

  const [updated] = await db
    .update(businesses)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(businesses.id, parsed.data.businessId))
    .returning({ id: businesses.id });
  if (!updated) return { ok: false, code: 'not_found', error: 'Business not found.' };

  await createAuditLog({
    action: 'ADMIN_BUSINESS_RESTORED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'business',
  });
  revalidateBusinessesPages();
  return { ok: true, data: { businessId: updated.id } };
}
