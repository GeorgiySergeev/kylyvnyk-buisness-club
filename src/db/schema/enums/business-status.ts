import { pgEnum } from "drizzle-orm/pg-core";

export const businessStatusEnum = pgEnum("business_status", [
  "UNDER_REVIEW",
  "PUBLISHED",
  "HIDDEN",
]);

export type BusinessStatus = (typeof businessStatusEnum.enumValues)[number];
