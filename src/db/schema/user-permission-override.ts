import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { users } from './user';

export const userPermissionOverrides = pgTable(
  'user_permission_overrides',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    assignedById: uuid('assigned_by_id').references(() => users.id, { onDelete: 'set null' }),
    resource: text('resource').notNull(),
    denyView: boolean('deny_view').notNull().default(false),
    denyCreate: boolean('deny_create').notNull().default(false),
    denyEdit: boolean('deny_edit').notNull().default(false),
    denyDelete: boolean('deny_delete').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userResourceUx: uniqueIndex('user_permission_overrides_user_resource_ux').on(t.userId, t.resource),
    userIdIdx: index('user_permission_overrides_user_id_idx').on(t.userId),
    assignedByIdIdx: index('user_permission_overrides_assigned_by_id_idx').on(t.assignedById),
    resourceIdx: index('user_permission_overrides_resource_idx').on(t.resource),
  }),
);
