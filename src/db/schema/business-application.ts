import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { categories } from "./category";
import { countries } from "./country";
import { businessStatusEnum } from "./enums/business-status";
import { users } from "./user";

export const businessApplications = pgTable(
  "business_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    businessName: text("business_name").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    representativeName: text("representative_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    countryId: integer("country_id")
      .notNull()
      .references(() => countries.id, { onDelete: "restrict" }),
    cityName: text("city_name").notNull(),
    websiteOrSocial: text("website_or_social").notNull(),
    confirmAuthority: boolean("confirm_authority").notNull().default(false),
    acceptLegal: boolean("accept_legal").notNull().default(false),
    status: businessStatusEnum("status").notNull().default("UNDER_REVIEW"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => ({
    categoryIdIdx: index("business_applications_category_id_idx").on(t.categoryId),
    countryIdIdx: index("business_applications_country_id_idx").on(t.countryId),
    statusIdx: index("business_applications_status_idx").on(t.status),
    userIdIdx: index("business_applications_user_id_idx").on(t.userId),
  }),
);
