import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  cardMemberTypeEnum,
  cardStatusEnum,
} from "./enums/card-status";
import { users } from "./user";

export const clubCards = pgTable(
  "club_cards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    number: text("number").unique().notNull(),
    memberType: cardMemberTypeEnum("member_type").notNull(),
    status: cardStatusEnum("status").notNull().default("ACTIVE"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    numberUx: uniqueIndex("club_cards_number_ux").on(t.number),
    userIdIdx: index("club_cards_user_id_idx").on(t.userId),
    statusIdx: index("club_cards_status_idx").on(t.status),
  }),
);
