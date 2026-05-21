--- a/prompts/META/step-2-drizzle-ddl/README.md
+++ b/prompts/META/step-2-drizzle-ddl/README.md
@@ src/db/schema/user.ts
-import { relations } from "drizzle-orm";
-import { profiles } from "./user"; // <- self-import, REMOVE
-import { auditLogs } from "./audit"; // <- breaks acyclic, REMOVE
-...
-export const usersRelations = relations(users, ({ many, one }) => ({

- profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
- auditLogs: many(auditLogs),
  -}));
  +// Tables only in this file. Relations live in ./\_relations.
  +// Do NOT import sibling table modules here.

@@ src/db/schema/audit.ts
-import { users } from "./user"; // REMOVE
-export const auditLogsRelations = relations(auditLogs, ({ one }) => ({

- actor: one(users, { fields: [auditLogs.actorUserId], references: [users.id] }),
  -}));
  +// Tables only. Relations in ./\_relations.

@@ NEW FILE src/db/schema/\_relations.ts
+import { relations } from "drizzle-orm";
+import { users } from "./user";
+import { profiles } from "./profile";
+import { auditLogs } from "./audit";
+import { memberships } from "./membership";
+import { businesses } from "./business";
+import { partnerOffers } from "./partner-offer";
+import { introductions } from "./introduction";
+import { cards } from "./card";
+import { subscriptions } from "./subscription";
+import { stripeEvents } from "./stripe-events";

- +export const usersRelations = relations(users, ({ one, many }) => ({
- profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
- memberships: many(memberships),
- businesses: many(businesses),
- cards: many(cards),
- auditLogs: many(auditLogs),
  +}));
- +export const profilesRelations = relations(profiles, ({ one }) => ({
- user: one(users, { fields: [profiles.userId], references: [users.id] }),
  +}));
- +export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
- actor: one(users, { fields: [auditLogs.actorUserId], references: [users.id] }),
  +}));
- +// ...same pattern for the rest.

@@ src/db/client.ts
-import _ as schema from "./schema";
+import _ as schema from "./schema";
+import \* as relations from "./schema/\_relations";
export const db = drizzle(pool, {

- schema,

* schema: { ...schema, ...relations },
  logger: process.env.NODE_ENV === "development",
  });
