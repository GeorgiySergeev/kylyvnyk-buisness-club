import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { roles } from './role';

export const permissions = pgTable(
  'permissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    resource: text('resource').notNull(),
    canView: boolean('can_view').notNull().default(false),
    canCreate: boolean('can_create').notNull().default(false),
    canEdit: boolean('can_edit').notNull().default(false),
    canDelete: boolean('can_delete').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    roleResourceUx: uniqueIndex('permissions_role_resource_ux').on(t.roleId, t.resource),
    roleIdIdx: index('permissions_role_id_idx').on(t.roleId),
    resourceIdx: index('permissions_resource_idx').on(t.resource),
  }),
);

export const RESOURCES = [
  'dashboard',
  'users',
  'businesses',
  'introductions',
  'cards',
  'categories',
  'countries',
  'cities',
  'stripe-links',
  'subscriptions',
  'memberships',
  'catalog',
  'audit',
  'roles',
] as const;

export type Resource = (typeof RESOURCES)[number];
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';
