import 'server-only';

import { and, desc, eq, ilike, isNull, or } from 'drizzle-orm';

import { db } from '@/db/client';
import { businesses } from '@/db/schema';

import { createPublicBusinessDto, type PublicBusinessDto } from './public-business-dto';

export type GetPublishedBusinessesOptions = {
  categoryId?: number;
  countryId?: number;
  isRecommended?: boolean;
  isTopPartner?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
};

export async function getPublishedBusinesses(
  opts: GetPublishedBusinessesOptions = {},
): Promise<PublicBusinessDto[]> {
  const {
    categoryId,
    countryId,
    isRecommended,
    isTopPartner,
    search,
    limit = 12,
    offset = 0,
  } = opts;

  const rows = await db.query.businesses.findMany({
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
      eq(businesses.status, 'PUBLISHED'),
      isNull(businesses.deletedAt),
      categoryId ? eq(businesses.categoryId, categoryId) : undefined,
      countryId ? eq(businesses.countryId, countryId) : undefined,
      isRecommended !== undefined ? eq(businesses.isRecommended, isRecommended) : undefined,
      isTopPartner !== undefined ? eq(businesses.isTopPartner, isTopPartner) : undefined,
      search
        ? or(ilike(businesses.name, `%${search}%`), ilike(businesses.slug, `%${search}%`))
        : undefined,
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
    orderBy: [
      desc(businesses.isTopPartner),
      desc(businesses.isRecommended),
      desc(businesses.createdAt),
    ],
    limit,
    offset,
  });

  return rows.map(createPublicBusinessDto);
}
