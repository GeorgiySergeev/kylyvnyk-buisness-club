'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { localizeHref, SUPPORTED_LOCALES } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { businesses } from '@/db/schema';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { setUserMembershipTier } from '@/features/billing/lib/membership-access';
import { BUSINESS_PLAN_CODE } from '@/features/billing/lib/plan-codes';
import { createAuditLog } from '@/lib/audit';
import { log } from '@/lib/log';

import type { AdminActionResult } from '../lib/action-result';
import { updateBusinessStatusSchema } from '../schemas/admin.schema';
import {
  createBusinessSchema,
  importBusinessesSchema,
  restoreBusinessSchema,
  softDeleteBusinessSchema,
  toggleBusinessFeatureSchema,
} from '../schemas/admin.schema';

type ActionResult<T> = { data: T; ok: true } | { error: string; ok: false };

function revalidateBusinessesPages() {
  SUPPORTED_LOCALES.forEach((locale) => {
    revalidatePath(localizeHref(locale, '/'));
    revalidatePath(localizeHref(locale, '/admin/businesses'));
    revalidatePath(localizeHref(locale, '/directory'));
  });
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
    .returning({ id: businesses.id, status: businesses.status, userId: businesses.userId });

  if (!updated) return { error: 'Business not found.', ok: false };

  if (parsed.data.status === 'PUBLISHED') {
    await setUserMembershipTier(updated.userId, BUSINESS_PLAN_CODE, new Date(), admin.data.id);
  }

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

  const updateValues: {
    isRecommended?: boolean;
    isTopPartner?: boolean;
    updatedAt: Date;
  } = { updatedAt: new Date() };

  if (parsed.data.isRecommended !== undefined) {
    updateValues.isRecommended = parsed.data.isRecommended;
  }

  if (parsed.data.isTopPartner !== undefined) {
    updateValues.isTopPartner = parsed.data.isTopPartner;
  }

  const [updated] = await db
    .update(businesses)
    .set(updateValues)
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

export async function createBusinessAction(
  rawInput: unknown,
): Promise<ActionResult<{ businessId: string }>> {
  const start = Date.now();
  const admin = await getCurrentUserWithRole('ADMIN');

  if (!admin.ok) {
    log.warn('Admin business create denied', { reason: admin.error });
    return { error: 'Unauthorized. Admin access required.', ok: false };
  }

  const parsed = createBusinessSchema.safeParse(rawInput);

  if (!parsed.success) {
    log.warn('Admin business create validation failed', { userId: admin.data.id });
    return { error: 'Invalid input.', ok: false };
  }

  const now = new Date();

  try {
    const owner = await db.query.users.findFirst({
      columns: { id: true },
      where: (u, { eq }) => eq(u.phone, parsed.data.ownerPhone),
    });

    if (!owner) {
      return { error: `User with phone "${parsed.data.ownerPhone}" not found.`, ok: false };
    }

    const slug = parsed.data.slug ?? slugify(parsed.data.name);

    const [business] = await db
      .insert(businesses)
      .values({
        cityId: null,
        countryId: null,
        description: parsed.data.description ?? null,
        email: parsed.data.email ?? null,
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        slug,
        status: parsed.data.status,
        userId: owner.id,
        website: parsed.data.website ?? null,
        updatedAt: now,
      })
      .returning({ id: businesses.id, name: businesses.name });

    if (!business) return { error: 'Failed to create business.', ok: false };

    await createAuditLog({
      action: 'ADMIN_BUSINESS_CREATED',
      actorUserId: admin.data.id,
      entityId: business.id,
      entityType: 'business',
      payload: { name: business.name, ownerPhone: parsed.data.ownerPhone },
    });

    revalidateBusinessesPages();
    log.info('Admin business created', {
      durationMs: Date.now() - start,
      targetBusinessId: business.id,
    });

    return { data: { businessId: business.id }, ok: true };
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === '23505') {
      return { error: 'Slug already exists.', ok: false };
    }

    throw error;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export interface ImportBusinessesResult {
  imported: number;
  total: number;
  errors: { row: number; name: string; error: string }[];
}

export async function importBusinessesAction(
  rawInput: unknown,
): Promise<ActionResult<ImportBusinessesResult>> {
  const start = Date.now();
  const admin = await getCurrentUserWithRole('ADMIN');

  if (!admin.ok) {
    log.warn('Admin businesses import denied', { reason: admin.error });
    return { error: 'Unauthorized. Admin access required.', ok: false };
  }

  const parsed = importBusinessesSchema.safeParse(rawInput);

  if (!parsed.success) {
    log.warn('Admin businesses import validation failed', { userId: admin.data.id });
    return { error: 'Invalid input', ok: false };
  }

  const errors: ImportBusinessesResult['errors'] = [];
  let imported = 0;
  const now = new Date();

  for (let i = 0; i < parsed.data.businesses.length; i++) {
    const row = parsed.data.businesses[i];
    const rowNum = i + 1;

    try {
      const owner = await db.query.users.findFirst({
        columns: { id: true },
        where: (u, { eq }) => eq(u.phone, row.ownerPhone),
      });

      if (!owner) {
        errors.push({ row: rowNum, name: row.name, error: `User with phone "${row.ownerPhone}" not found` });
        continue;
      }

      const slug = row.slug ?? slugify(row.name);

      const [business] = await db
        .insert(businesses)
        .values({
          cityId: null,
          countryId: null,
          description: row.description ?? null,
          email: row.email ?? null,
          name: row.name,
          phone: row.phone ?? null,
          slug,
          status: row.status,
          userId: owner.id,
          website: row.website ?? null,
          updatedAt: now,
        })
        .returning({ id: businesses.id });

      if (!business) throw new Error('Failed to create business.');

      imported++;
    } catch (error) {
      const code = (error as { code?: string })?.code;
      const message = code === '23505'
        ? 'Slug already exists'
        : (error as Error)?.message ?? 'Unknown error';

      errors.push({ row: rowNum, name: row.name, error: message });
    }
  }

  await createAuditLog({
    action: 'ADMIN_BUSINESSES_IMPORTED',
    actorUserId: admin.data.id,
    entityType: 'business',
    payload: { imported, total: parsed.data.businesses.length, errorCount: errors.length },
  });

  revalidateBusinessesPages();
  log.info('Admin businesses imported', {
    durationMs: Date.now() - start,
    imported,
    total: parsed.data.businesses.length,
    errors: errors.length,
  });

  return {
    data: { imported, total: parsed.data.businesses.length, errors },
    ok: true,
  };
}
