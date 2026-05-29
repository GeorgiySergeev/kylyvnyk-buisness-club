import { index, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { roles } from './role';
import { users } from './user';

export const userRoles = pgTable(
  'user_roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    assignedById: uuid('assigned_by_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userRoleUx: uniqueIndex('user_roles_user_role_ux').on(t.userId, t.roleId),
    userIdIdx: index('user_roles_user_id_idx').on(t.userId),
    roleIdIdx: index('user_roles_role_id_idx').on(t.roleId),
  }),
);
