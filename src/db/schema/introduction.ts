import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { businesses } from "./business";
import { introductionStatusEnum } from "./enums/introduction-status";
import { users } from "./user";

export const introductions = pgTable(
  "introductions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requesterId: uuid("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    targetBusinessId: uuid("target_business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "restrict" }),
    clientName: text("client_name").notNull(),
    clientContact: text("client_contact").notNull(),
    message: text("message"),
    status: introductionStatusEnum("status").notNull().default("SUBMITTED"),
    adminNote: text("admin_note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    requesterIdIdx: index("introductions_requester_id_idx").on(
      t.requesterId,
    ),
    targetBusinessIdIdx: index("introductions_target_business_id_idx").on(
      t.targetBusinessId,
    ),
    statusIdx: index("introductions_status_idx").on(t.status),
    createdAtIdx: index("introductions_created_at_idx").on(t.createdAt),
  }),
);
