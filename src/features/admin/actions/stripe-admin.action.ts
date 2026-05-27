'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { localizeHref, SUPPORTED_LOCALES } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { stripeLinks } from '@/db/schema';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { createAuditLog } from '@/lib/audit';

import type { AdminActionResult } from '../lib/action-result';
import {
  createStripeLinkSchema,
  deleteStripeLinkSchema,
  updateStripeLinkSchema,
} from '../schemas/admin.schema';

function revalidateStripePages() {
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(localizeHref(locale, '/admin/stripe-links'));
  }
}

export async function createStripeLinkAction(
  rawInput: unknown,
): Promise<AdminActionResult<{ stripeLinkId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = createStripeLinkSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };

  const [created] = await db.insert(stripeLinks).values(parsed.data).returning({ id: stripeLinks.id });
  await createAuditLog({
    action: 'ADMIN_STRIPE_LINK_CREATED',
    actorUserId: admin.data.id,
    entityId: created.id,
    entityType: 'stripe_link',
    payload: parsed.data,
  });
  revalidateStripePages();
  return { ok: true, data: { stripeLinkId: created.id } };
}

export async function updateStripeLinkAction(
  rawInput: unknown,
): Promise<AdminActionResult<{ stripeLinkId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = updateStripeLinkSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };

  const { stripeLinkId, ...update } = parsed.data;
  const [updated] = await db
    .update(stripeLinks)
    .set({ ...update, updatedAt: new Date() })
    .where(eq(stripeLinks.id, stripeLinkId))
    .returning({ id: stripeLinks.id });

  if (!updated) return { ok: false, code: 'not_found', error: 'Stripe link not found.' };

  await createAuditLog({
    action: 'ADMIN_STRIPE_LINK_UPDATED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'stripe_link',
    payload: update,
  });
  revalidateStripePages();
  return { ok: true, data: { stripeLinkId: updated.id } };
}

export async function deleteStripeLinkAction(
  rawInput: unknown,
): Promise<AdminActionResult<{ stripeLinkId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = deleteStripeLinkSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };

  const [updated] = await db
    .update(stripeLinks)
    .set({ deletedAt: new Date(), status: 'INACTIVE', updatedAt: new Date() })
    .where(eq(stripeLinks.id, parsed.data.stripeLinkId))
    .returning({ id: stripeLinks.id });

  if (!updated) return { ok: false, code: 'not_found', error: 'Stripe link not found.' };

  await createAuditLog({
    action: 'ADMIN_STRIPE_LINK_SOFT_DELETED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'stripe_link',
  });
  revalidateStripePages();
  return { ok: true, data: { stripeLinkId: updated.id } };
}
