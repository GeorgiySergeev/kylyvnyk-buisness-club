import { pgEnum } from "drizzle-orm/pg-core";

export const cardStatusEnum = pgEnum("card_status", [
  "ACTIVE",
  "INACTIVE",
  "EXPIRED",
  "ARCHIVED",
]);

export type CardStatus = (typeof cardStatusEnum.enumValues)[number];

export const cardMemberTypeEnum = pgEnum("card_member_type", [
  "VIP",
  "BUSINESS",
  "FREE",
]);

export type CardMemberType = (typeof cardMemberTypeEnum.enumValues)[number];
