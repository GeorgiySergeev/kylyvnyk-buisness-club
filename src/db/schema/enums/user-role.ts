import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "FREE",
  "BUSINESS",
  "ADMIN",
]);

export type UserRole = (typeof userRoleEnum.enumValues)[number];
