import { relations } from "drizzle-orm";

import { auditLogs } from "./audit";
import { businesses } from "./business";
import { clubCards } from "./card";
import { categories } from "./category";
import { cities } from "./city";
import { countries } from "./country";
import { introductions } from "./introduction";
import { profiles } from "./profile";
import { users } from "./user";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  businesses: many(businesses),
  cards: many(clubCards),
  introductions: many(introductions, { relationName: "requester" }),
  auditLogs: many(auditLogs),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  country: one(countries, {
    fields: [profiles.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [profiles.cityId],
    references: [cities.id],
  }),
}));

export const countriesRelations = relations(countries, ({ many }) => ({
  cities: many(cities),
  profiles: many(profiles),
  businesses: many(businesses),
}));

export const citiesRelations = relations(cities, ({ one, many }) => ({
  country: one(countries, {
    fields: [cities.countryId],
    references: [countries.id],
  }),
  profiles: many(profiles),
  businesses: many(businesses),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  businesses: many(businesses),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "subcategories",
  }),
  children: many(categories, { relationName: "subcategories" }),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  user: one(users, {
    fields: [businesses.userId],
    references: [users.id],
  }),
  country: one(countries, {
    fields: [businesses.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [businesses.cityId],
    references: [cities.id],
  }),
  category: one(categories, {
    fields: [businesses.categoryId],
    references: [categories.id],
  }),
  introductions: many(introductions, { relationName: "targetBusiness" }),
}));

export const clubCardsRelations = relations(clubCards, ({ one }) => ({
  user: one(users, {
    fields: [clubCards.userId],
    references: [users.id],
  }),
}));

export const introductionsRelations = relations(
  introductions,
  ({ one }) => ({
    requester: one(users, {
      fields: [introductions.requesterId],
      references: [users.id],
      relationName: "requester",
    }),
    targetBusiness: one(businesses, {
      fields: [introductions.targetBusinessId],
      references: [businesses.id],
      relationName: "targetBusiness",
    }),
  }),
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id],
  }),
}));
