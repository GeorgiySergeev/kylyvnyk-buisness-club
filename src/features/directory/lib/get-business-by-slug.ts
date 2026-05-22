import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db/client";
import { businesses } from "@/db/schema";

export async function getBusinessBySlug(slug: string) {
  return db.query.businesses.findFirst({
    where: and(
      eq(businesses.slug, slug),
      eq(businesses.status, "PUBLISHED"),
      isNull(businesses.deletedAt),
    ),
    with: {
      user: true,
      category: true,
      country: true,
      city: true,
    },
  });
}
