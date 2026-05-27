'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { localizeHref, SUPPORTED_LOCALES } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { clubCards } from '@/db/schema';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { createAuditLog } from '@/lib/audit';

import type { AdminActionResult } from '../lib/action-result';
import { createCardSchema, updateCardSchema } from '../schemas/admin.schema';

function revalidateCardsPages() {
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(localizeHref(locale, '/admin/cards'));
  }
}

export async function createCardAction(rawInput: unknown): Promise<AdminActionResult<{ cardId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = createCardSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };

  const [created] = await db.insert(clubCards).values(parsed.data).returning({ id: clubCards.id });
  await createAuditLog({
    action: 'ADMIN_CARD_CREATED',
    actorUserId: admin.data.id,
    entityId: created.id,
    entityType: 'card',
    payload: parsed.data,
  });
  revalidateCardsPages();
  return { ok: true, data: { cardId: created.id } };
}

export async function updateCardAction(rawInput: unknown): Promise<AdminActionResult<{ cardId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = updateCardSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };
  const { cardId, ...update } = parsed.data;
  const [updated] = await db
    .update(clubCards)
    .set({ ...update, updatedAt: new Date() })
    .where(eq(clubCards.id, cardId))
    .returning({ id: clubCards.id });
  if (!updated) return { ok: false, code: 'not_found', error: 'Card not found.' };

  await createAuditLog({
    action: 'ADMIN_CARD_UPDATED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'card',
    payload: update,
  });
  revalidateCardsPages();
  return { ok: true, data: { cardId: updated.id } };
}
