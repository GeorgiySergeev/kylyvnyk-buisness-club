import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { userRoleEnum } from './enums/user-role';
import { userStatusEnum } from './enums/user-status';

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    supabaseUserId: text('supabase_user_id').unique(),
    phone: text('phone').unique().notNull(),
    email: text('email').unique(),
    displayName: text('display_name'),
    role: userRoleEnum('role').notNull().default('MEMBER'),
    status: userStatusEnum('status').notNull().default('ACTIVE'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => ({
    supabaseUserIdUx: uniqueIndex('users_supabase_user_id_ux').on(t.supabaseUserId),
    phoneUx: uniqueIndex('users_phone_ux').on(t.phone),
    emailUx: uniqueIndex('users_email_ux').on(t.email),
    roleIdx: index('users_role_idx').on(t.role),
    statusIdx: index('users_status_idx').on(t.status),
  }),
);
