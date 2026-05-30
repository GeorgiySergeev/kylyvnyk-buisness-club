import 'server-only';

import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { businesses } from '@/db/schema';

import { slugifyBusinessName } from './slugify-business-name';

export { slugifyBusinessName } from './slugify-business-name';

export async function generateUniqueBusinessSlug(name: string): Promise<string> {
  const base = slugifyBusinessName(name);

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const suffix = attempt === 0 ? '' : `-${attempt + 1}`;
    const slug = `${base}${suffix}`;
    const existing = await db.query.businesses.findFirst({
      columns: { id: true },
      where: eq(businesses.slug, slug),
    });

    if (!existing) {
      return slug;
    }
  }

  return `${base}-${Date.now()}`;
}
