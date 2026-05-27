import 'server-only';

import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@/db/client';
import { businesses } from '@/db/schema';

import { createPublicBusinessDto, type PublicBusinessDto } from './public-business-dto';

export async function getBusinessBySlug(slug: string): Promise<PublicBusinessDto | null> {
  const row = await db.query.businesses.findFirst({
    columns: {
      description: true,
      discountLabel: true,
      id: true,
      isRecommended: true,
      isTopPartner: true,
      logoUrl: true,
      name: true,
      slug: true,
      website: true,
    },
    where: and(
      eq(businesses.slug, slug),
      eq(businesses.status, 'PUBLISHED'),
      isNull(businesses.deletedAt),
    ),
    with: {
      category: {
        columns: {
          name: true,
          slug: true,
        },
      },
      city: {
        columns: {
          name: true,
        },
      },
      country: {
        columns: {
          flagEmoji: true,
          iso2: true,
          name: true,
        },
      },
    },
  });

  return row ? createPublicBusinessDto(row) : null;
}
