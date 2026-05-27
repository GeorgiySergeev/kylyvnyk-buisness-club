'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { localizeHref, SUPPORTED_LOCALES } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { catalogItems } from '@/db/schema';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { createAuditLog } from '@/lib/audit';

import type { AdminActionResult } from '../lib/action-result';

function revalidateCatalogPages() {
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(localizeHref(locale, '/admin/catalog'));
  }
}

export async function createCatalogItemAction(rawInput: unknown): Promise<AdminActionResult<{ catalogItemId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };

  const input = rawInput as {
    businessId?: string;
    slug?: string;
    status?: string;
    summary?: string | null;
    title?: string;
  };

  if (!input.businessId || !input.slug || !input.status || !input.title) {
    return { ok: false, code: 'validation', error: 'Invalid input.' };
  }

  const [created] = await db
    .insert(catalogItems)
    .values({
      businessId: input.businessId,
      slug: input.slug,
      status: input.status,
      summary: input.summary ?? null,
      title: input.title,
    })
    .returning({ id: catalogItems.id });

  await createAuditLog({
    action: 'ADMIN_CATALOG_ITEM_CREATED',
    actorUserId: admin.data.id,
    entityId: created.id,
    entityType: 'catalog_item',
    payload: input,
  });

  revalidateCatalogPages();
  return { ok: true, data: { catalogItemId: created.id } };
}

export async function updateCatalogItemAction(rawInput: unknown): Promise<AdminActionResult<{ catalogItemId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };

  const input = rawInput as {
    catalogItemId?: string;
    slug?: string;
    status?: string;
    summary?: string | null;
    title?: string;
  };

  if (!input.catalogItemId || !input.slug || !input.status || !input.title) {
    return { ok: false, code: 'validation', error: 'Invalid input.' };
  }

  const [updated] = await db
    .update(catalogItems)
    .set({
      slug: input.slug,
      status: input.status,
      summary: input.summary ?? null,
      title: input.title,
      updatedAt: new Date(),
    })
    .where(eq(catalogItems.id, input.catalogItemId))
    .returning({ id: catalogItems.id });

  if (!updated) return { ok: false, code: 'not_found', error: 'Catalog item not found.' };

  await createAuditLog({
    action: 'ADMIN_CATALOG_ITEM_UPDATED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'catalog_item',
    payload: input,
  });

  revalidateCatalogPages();
  return { ok: true, data: { catalogItemId: updated.id } };
}

export async function softDeleteCatalogItemAction(rawInput: unknown): Promise<AdminActionResult<{ catalogItemId: string }>> {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };

  const input = rawInput as { catalogItemId?: string };
  if (!input.catalogItemId) return { ok: false, code: 'validation', error: 'Invalid input.' };

  const [updated] = await db
    .update(catalogItems)
    .set({ deletedAt: new Date(), status: 'ARCHIVED', updatedAt: new Date() })
    .where(eq(catalogItems.id, input.catalogItemId))
    .returning({ id: catalogItems.id });

  if (!updated) return { ok: false, code: 'not_found', error: 'Catalog item not found.' };

  await createAuditLog({
    action: 'ADMIN_CATALOG_ITEM_SOFT_DELETED',
    actorUserId: admin.data.id,
    entityId: updated.id,
    entityType: 'catalog_item',
  });

  revalidateCatalogPages();
  return { ok: true, data: { catalogItemId: updated.id } };
}
