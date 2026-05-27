import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['GUEST', 'MEMBER', 'MANAGER', 'ADMIN', 'OWNER']);

export type UserRole = (typeof userRoleEnum.enumValues)[number];
