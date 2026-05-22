import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  index,
  integer,
  pgTable,
  serial,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    icon: text("icon"),
    parentId: integer("parent_id").references(
      (): AnyPgColumn => categories.id,
      { onDelete: "set null" },
    ),
  },
  (t) => ({
    slugUx: uniqueIndex("categories_slug_ux").on(t.slug),
    parentIdIdx: index("categories_parent_id_idx").on(t.parentId),
  }),
);
