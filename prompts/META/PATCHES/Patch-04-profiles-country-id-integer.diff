--- a/prompts/META/step-2-drizzle-ddl/README.md
+++ b/prompts/META/step-2-drizzle-ddl/README.md
@@ profiles
-  countryId: varchar("country_id", { length: 36 }), // soft FK, may be refactored to integer later
+  countryId: integer("country_id").references(() => countries.id, { onDelete: "set null" }),
+  // Hard FK from day 1 — keeps join parity with businesses.country_id.
+  // If you need the ISO-2 string, expose it via a view, not as a duplicate column.
@@ profiles indexes
   profileUserUx: uniqueIndex("profiles_user_id_ux").on(t.userId),
+  profileCountryIdx: index("profiles_country_id_idx").on(t.countryId),