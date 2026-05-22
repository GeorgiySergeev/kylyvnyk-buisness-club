import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { cities } from "./city";
import { countries } from "./country";
import { users } from "./user";

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    avatarUrl: text("avatar_url"),
    countryId: integer("country_id").references(() => countries.id, {
      onDelete: "set null",
    }),
    cityId: integer("city_id").references(() => cities.id, {
      onDelete: "set null",
    }),
    bio: text("bio"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdUx: uniqueIndex("profiles_user_id_ux").on(t.userId),
    countryIdIdx: index("profiles_country_id_idx").on(t.countryId),
  }),
);
