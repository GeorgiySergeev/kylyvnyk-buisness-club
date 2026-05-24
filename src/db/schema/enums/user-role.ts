import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "FREE",
  "BUSINESS",
  "ADMIN",
  "VIP",
]);

export type UserRole = (typeof userRoleEnum.enumValues)[number];
