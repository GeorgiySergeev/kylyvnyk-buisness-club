import { z } from 'zod';

import { SUPPORTED_LOCALES } from '@/components/layout/navigation';

export const adminSearchInputSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
  q: z.string().trim().max(120),
});

export type AdminSearchInput = z.infer<typeof adminSearchInputSchema>;

export function normalizeAdminSearchQuery(value: string): string | null {
  const query = value.trim();
  return query.length >= 2 ? query : null;
}
