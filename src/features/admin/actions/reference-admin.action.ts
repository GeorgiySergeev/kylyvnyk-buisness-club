'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { localizeHref, SUPPORTED_LOCALES } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { businesses, categories, cities, countries, profiles } from '@/db/schema';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { createAuditLog } from '@/lib/audit';

import type { AdminActionResult } from '../lib/action-result';
import {
  createCategorySchema,
  createCitySchema,
  createCountrySchema,
  deleteCategorySchema,
  deleteCitySchema,
  deleteCountrySchema,
  updateCategorySchema,
  updateCitySchema,
  updateCountrySchema,
} from '../schemas/admin.schema';

function revalidateReferencePages() {
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(localizeHref(locale, '/admin/categories'));
    revalidatePath(localizeHref(locale, '/admin/countries'));
  }
}

async function requireAdmin() {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return null;
  return admin.data;
}

export async function createCountryAction(rawInput: unknown): Promise<AdminActionResult<{ countryId: number }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = createCountrySchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };

  const [created] = await db.insert(countries).values(parsed.data).returning({ id: countries.id });
  await createAuditLog({ action: 'ADMIN_COUNTRY_CREATED', actorUserId: admin.id, entityType: 'country', entityId: String(created.id), payload: parsed.data });
  revalidateReferencePages();
  return { ok: true, data: { countryId: created.id } };
}

export async function updateCountryAction(rawInput: unknown): Promise<AdminActionResult<{ countryId: number }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = updateCountrySchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };
  const { countryId, ...update } = parsed.data;
  const [updated] = await db.update(countries).set(update).where(eq(countries.id, countryId)).returning({ id: countries.id });
  if (!updated) return { ok: false, code: 'not_found', error: 'Country not found.' };
  await createAuditLog({ action: 'ADMIN_COUNTRY_UPDATED', actorUserId: admin.id, entityType: 'country', entityId: String(updated.id), payload: update });
  revalidateReferencePages();
  return { ok: true, data: { countryId: updated.id } };
}

export async function deleteCountryAction(rawInput: unknown): Promise<AdminActionResult<{ countryId: number }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = deleteCountrySchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };

  const [businessCount, profileCount, cityCount] = await Promise.all([
    db.$count(businesses, eq(businesses.countryId, parsed.data.countryId)),
    db.$count(profiles, eq(profiles.countryId, parsed.data.countryId)),
    db.$count(cities, eq(cities.countryId, parsed.data.countryId)),
  ]);
  if (businessCount > 0 || profileCount > 0 || cityCount > 0) {
    return {
      ok: false,
      code: 'conflict',
      error: `Country has linked records (businesses: ${businessCount}, profiles: ${profileCount}, cities: ${cityCount}).`,
    };
  }
  const [deleted] = await db.delete(countries).where(eq(countries.id, parsed.data.countryId)).returning({ id: countries.id });
  if (!deleted) return { ok: false, code: 'not_found', error: 'Country not found.' };
  await createAuditLog({ action: 'ADMIN_COUNTRY_DELETED', actorUserId: admin.id, entityType: 'country', entityId: String(deleted.id) });
  revalidateReferencePages();
  return { ok: true, data: { countryId: deleted.id } };
}

export async function createCityAction(rawInput: unknown): Promise<AdminActionResult<{ cityId: number }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = createCitySchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };
  const [created] = await db.insert(cities).values(parsed.data).returning({ id: cities.id });
  await createAuditLog({ action: 'ADMIN_CITY_CREATED', actorUserId: admin.id, entityType: 'city', entityId: String(created.id), payload: parsed.data });
  revalidateReferencePages();
  return { ok: true, data: { cityId: created.id } };
}

export async function updateCityAction(rawInput: unknown): Promise<AdminActionResult<{ cityId: number }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = updateCitySchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };
  const { cityId, ...update } = parsed.data;
  const [updated] = await db.update(cities).set(update).where(eq(cities.id, cityId)).returning({ id: cities.id });
  if (!updated) return { ok: false, code: 'not_found', error: 'City not found.' };
  await createAuditLog({ action: 'ADMIN_CITY_UPDATED', actorUserId: admin.id, entityType: 'city', entityId: String(updated.id), payload: update });
  revalidateReferencePages();
  return { ok: true, data: { cityId: updated.id } };
}

export async function deleteCityAction(rawInput: unknown): Promise<AdminActionResult<{ cityId: number }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = deleteCitySchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };
  const [businessCount, profileCount] = await Promise.all([
    db.$count(businesses, eq(businesses.cityId, parsed.data.cityId)),
    db.$count(profiles, eq(profiles.cityId, parsed.data.cityId)),
  ]);
  if (businessCount > 0 || profileCount > 0) {
    return {
      ok: false,
      code: 'conflict',
      error: `City has linked records (businesses: ${businessCount}, profiles: ${profileCount}).`,
    };
  }
  const [deleted] = await db.delete(cities).where(eq(cities.id, parsed.data.cityId)).returning({ id: cities.id });
  if (!deleted) return { ok: false, code: 'not_found', error: 'City not found.' };
  await createAuditLog({ action: 'ADMIN_CITY_DELETED', actorUserId: admin.id, entityType: 'city', entityId: String(deleted.id) });
  revalidateReferencePages();
  return { ok: true, data: { cityId: deleted.id } };
}

function categoryCreatesCycle(rows: Array<{ id: number; parentId: number | null }>, categoryId: number, nextParentId: number | null) {
  if (!nextParentId) return false;
  const byId = new Map(rows.map((row) => [row.id, row.parentId]));
  let cursor: number | null = nextParentId;
  while (cursor !== null) {
    if (cursor === categoryId) return true;
    cursor = byId.get(cursor) ?? null;
  }
  return false;
}

export async function createCategoryAction(rawInput: unknown): Promise<AdminActionResult<{ categoryId: number }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = createCategorySchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };
  const [created] = await db.insert(categories).values(parsed.data).returning({ id: categories.id });
  await createAuditLog({ action: 'ADMIN_CATEGORY_CREATED', actorUserId: admin.id, entityType: 'category', entityId: String(created.id), payload: parsed.data });
  revalidateReferencePages();
  return { ok: true, data: { categoryId: created.id } };
}

export async function updateCategoryAction(rawInput: unknown): Promise<AdminActionResult<{ categoryId: number }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = updateCategorySchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };
  const rows = await db.query.categories.findMany({ columns: { id: true, parentId: true } });
  if (categoryCreatesCycle(rows, parsed.data.categoryId, parsed.data.parentId ?? null)) {
    return { ok: false, code: 'conflict', error: 'Parent relation creates cycle.' };
  }
  const { categoryId, ...update } = parsed.data;
  const [updated] = await db.update(categories).set(update).where(eq(categories.id, categoryId)).returning({ id: categories.id });
  if (!updated) return { ok: false, code: 'not_found', error: 'Category not found.' };
  await createAuditLog({ action: 'ADMIN_CATEGORY_UPDATED', actorUserId: admin.id, entityType: 'category', entityId: String(updated.id), payload: update });
  revalidateReferencePages();
  return { ok: true, data: { categoryId: updated.id } };
}

export async function deleteCategoryAction(rawInput: unknown): Promise<AdminActionResult<{ categoryId: number }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, code: 'unauthorized', error: 'Unauthorized.' };
  const parsed = deleteCategorySchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, code: 'validation', error: 'Invalid input.' };
  const [businessCount, childCount] = await Promise.all([
    db.$count(businesses, eq(businesses.categoryId, parsed.data.categoryId)),
    db.$count(categories, eq(categories.parentId, parsed.data.categoryId)),
  ]);
  if (businessCount > 0 || childCount > 0) {
    return {
      ok: false,
      code: 'conflict',
      error: `Category has linked records (businesses: ${businessCount}, children: ${childCount}).`,
    };
  }
  const [deleted] = await db.delete(categories).where(eq(categories.id, parsed.data.categoryId)).returning({ id: categories.id });
  if (!deleted) return { ok: false, code: 'not_found', error: 'Category not found.' };
  await createAuditLog({ action: 'ADMIN_CATEGORY_DELETED', actorUserId: admin.id, entityType: 'category', entityId: String(deleted.id) });
  revalidateReferencePages();
  return { ok: true, data: { categoryId: deleted.id } };
}
