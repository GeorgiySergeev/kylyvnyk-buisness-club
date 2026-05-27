import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { users } from "./user";

export const stripeLinks = pgTable(
  "stripe_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    code: text("code").notNull(),
    paymentLinkUrl: text("payment_link_url").notNull(),
    status: text("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => ({
    codeUx: uniqueIndex("stripe_links_code_ux").on(t.code),
    statusIdx: index("stripe_links_status_idx").on(t.status),
  }),
);

export const stripeSubscriptions = pgTable(
  "stripe_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    stripeSubscriptionId: text("stripe_subscription_id").notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    status: text("status").notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    stripeSubscriptionUx: uniqueIndex("stripe_subscriptions_stripe_id_ux").on(t.stripeSubscriptionId),
    statusIdx: index("stripe_subscriptions_status_idx").on(t.status),
  }),
);
