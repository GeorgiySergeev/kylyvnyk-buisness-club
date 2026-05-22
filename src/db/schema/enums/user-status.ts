import { pgEnum } from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "INACTIVE",
  "BANNED",
]);

export type UserStatus = (typeof userStatusEnum.enumValues)[number];
