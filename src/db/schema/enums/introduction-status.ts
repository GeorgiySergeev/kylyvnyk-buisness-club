import { pgEnum } from "drizzle-orm/pg-core";

export const introductionStatusEnum = pgEnum("introduction_status", [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "CLOSED",
]);

export type IntroductionStatus =
  (typeof introductionStatusEnum.enumValues)[number];
