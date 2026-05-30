import { pgEnum } from "drizzle-orm/pg-core";

export const businessStatusEnum = pgEnum("business_status", [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "HIDDEN",
  "DECLINED",
]);

export type BusinessStatus = (typeof businessStatusEnum.enumValues)[number];
