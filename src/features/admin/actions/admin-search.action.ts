'use server';

import type { AdminSearchResult } from '@/features/admin/lib/admin-search';
import { searchAdminRecords } from '@/features/admin/lib/admin-search';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { log } from '@/lib/log';

import { adminSearchInputSchema } from '../schemas/admin-search.schema';

type AdminSearchActionResult =
  | { data: AdminSearchResult[]; ok: true }
  | { error: string; ok: false };

export async function searchAdminRecordsAction(
  rawInput: unknown,
): Promise<AdminSearchActionResult> {
  const admin = await getCurrentUserWithRole(['ADMIN', 'OWNER']);
  if (!admin.ok) return { error: 'Unauthorized.', ok: false };

  const parsed = adminSearchInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    log.warn('Admin global search validation failed', { userId: admin.data.id });
    return { error: 'Invalid search query.', ok: false };
  }

  const results = await searchAdminRecords(parsed.data.q, parsed.data.locale);
  return { data: results, ok: true };
}
