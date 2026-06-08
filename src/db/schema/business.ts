import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { categories } from "./category";
import { cities } from "./city";
import { countries } from "./country";
import { businessStatusEnum } from "./enums/business-status";
import { users } from "./user";

export const businesses = pgTable(
  "businesses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description"),
    logoUrl: text("logo_url"),
    website: text("website"),
    phone: text("phone"),
    email: text("email"),
    countryId: integer("country_id").references(() => countries.id, {
      onDelete: "set null",
    }),
    cityId: integer("city_id").references(() => cities.id, {
      onDelete: "set null",
    }),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    status: businessStatusEnum("status").notNull().default("UNDER_REVIEW"),
    isTopPartner: boolean("is_top_partner").notNull().default(false),
    isRecommended: boolean("is_recommended").notNull().default(false),
    discountLabel: text("discount_label"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => ({
    slugUx: uniqueIndex("businesses_slug_ux").on(t.slug),
    userIdIdx: index("businesses_user_id_idx").on(t.userId),
    statusIdx: index("businesses_status_idx").on(t.status),
    categoryIdIdx: index("businesses_category_id_idx").on(t.categoryId),
    countryIdIdx: index("businesses_country_id_idx").on(t.countryId),
    cityIdIdx: index("businesses_city_id_idx").on(t.cityId),
    topPartnerIdx: index("businesses_top_partner_idx").on(t.isTopPartner),
  }),
);
