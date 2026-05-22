import { index, integer, pgTable, serial, text, uniqueIndex } from "drizzle-orm/pg-core";

import { countries } from "./country";

export const cities = pgTable(
  "cities",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    countryId: integer("country_id")
      .notNull()
      .references(() => countries.id, { onDelete: "cascade" }),
  },
  (t) => ({
    countryIdIdx: index("cities_country_id_idx").on(t.countryId),
    nameCountryUx: uniqueIndex("cities_name_country_ux").on(
      t.name,
      t.countryId,
    ),
  }),
);
