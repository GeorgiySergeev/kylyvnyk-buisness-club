import {
  char,
  pgTable,
  serial,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const countries = pgTable(
  "countries",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    iso2: char("iso2", { length: 2 }).unique().notNull(),
    flagEmoji: text("flag_emoji"),
  },
  (t) => ({
    iso2Ux: uniqueIndex("countries_iso2_ux").on(t.iso2),
  }),
);
