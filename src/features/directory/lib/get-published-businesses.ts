import "server-only";

import { and, desc, eq, ilike, isNull } from "drizzle-orm";

import { db } from "@/db/client";
import { businesses } from "@/db/schema";

export type GetPublishedBusinessesOptions = {
  categoryId?: number;
  countryId?: number;
  search?: string;
  limit?: number;
  offset?: number;
};

export async function getPublishedBusinesses(
  opts: GetPublishedBusinessesOptions = {},
) {
  const { categoryId, countryId, search, limit = 12, offset = 0 } = opts;

  return db.query.businesses.findMany({
    where: and(
      eq(businesses.status, "PUBLISHED"),
      isNull(businesses.deletedAt),
      categoryId ? eq(businesses.categoryId, categoryId) : undefined,
      countryId ? eq(businesses.countryId, countryId) : undefined,
      search ? ilike(businesses.name, `%${search}%`) : undefined,
    ),
    with: {
      category: true,
      country: true,
    },
    orderBy: [
      desc(businesses.isTopPartner),
      desc(businesses.isRecommended),
      desc(businesses.createdAt),
    ],
    limit,
    offset,
  });
}
