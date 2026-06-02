import 'server-only';

import { and, eq, inArray, or } from 'drizzle-orm';
import { headers } from 'next/headers';

import { db } from '@/db/client';
import { permissions } from '@/db/schema';
import type { PermissionAction, Resource } from '@/db/schema/permission';
import {
  applyPermissionOverrides,
  mergePermissions,
  type MergedPermission,
  type PermissionOverrideSummary,
} from '@/lib/auth/permission-override-helpers';

export type { PermissionAction, Resource };

export interface RoleWithPermissions {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  permissions: {
    resource: Resource;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  }[];
}

async function getRoleIdsForUser(userId: string): Promise<string[]> {
  const userRoleAssignments = await db.query.userRoles.findMany({
    where: (table, { eq }) => eq(table.userId, userId),
    columns: { roleId: true },
  });
  return userRoleAssignments.map((a) => a.roleId);
}

export async function getUserPermissionOverrides(userId: string): Promise<PermissionOverrideSummary[]> {
  const overrides = await db.query.userPermissionOverrides.findMany({
    columns: {
      denyCreate: true,
      denyDelete: true,
      denyEdit: true,
      denyView: true,
      resource: true,
    },
    where: (table, { eq }) => eq(table.userId, userId),
  });

  return overrides.map((override) => ({
    resource: override.resource as Resource,
    denyView: override.denyView,
    denyCreate: override.denyCreate,
    denyEdit: override.denyEdit,
    denyDelete: override.denyDelete,
  }));
}

export async function getUserRoles(userId: string) {
  const assignments = await db.query.userRoles.findMany({
    where: (table, { eq }) => eq(table.userId, userId),
    with: {
      role: true,
    },
  });
  return assignments.map((a) => a.role);
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const userRolesList = await getUserRoles(userId);
  return userRolesList.some((r) => r.slug === 'super_admin');
}

export async function canAccess(
  userId: string,
  resource: Resource,
  action: PermissionAction,
): Promise<boolean> {
  if (await isSuperAdmin(userId)) {
    return true;
  }

  const roleIds = await getRoleIdsForUser(userId);
  if (roleIds.length === 0) return false;

  const perms = await db
    .select()
    .from(permissions)
    .where(
      and(
        inArray(permissions.roleId, roleIds),
        eq(permissions.resource, resource),
        or(
          action === 'view' ? eq(permissions.canView, true) : undefined,
          action === 'create' ? eq(permissions.canCreate, true) : undefined,
          action === 'edit' ? eq(permissions.canEdit, true) : undefined,
          action === 'delete' ? eq(permissions.canDelete, true) : undefined,
        ),
      ),
    );

  if (perms.length === 0) {
    return false;
  }

  const overrides = await getUserPermissionOverrides(userId);
  const effectivePermissions = applyPermissionOverrides(
    mergePermissions(
      perms.map((permission) => ({
        resource: permission.resource,
        canView: permission.canView,
        canCreate: permission.canCreate,
        canEdit: permission.canEdit,
        canDelete: permission.canDelete,
      })),
    ),
    overrides,
  );

  const effective = effectivePermissions.find((permission) => permission.resource === resource);

  if (!effective) {
    return false;
  }

  if (action === 'view') return effective.canView;
  if (action === 'create') return effective.canCreate;
  if (action === 'edit') return effective.canEdit;
  return effective.canDelete;
}

export async function getUserRolesWithPermissions(userId: string): Promise<RoleWithPermissions[]> {
  const assignments = await db.query.userRoles.findMany({
    where: (table, { eq }) => eq(table.userId, userId),
    with: {
      role: {
        with: {
          permissions: true,
        },
      },
    },
  });

  return assignments.map((a) => ({
    id: a.role.id,
    name: a.role.name,
    slug: a.role.slug,
    description: a.role.description,
    isSystem: a.role.isSystem,
    permissions: a.role.permissions.map((p) => ({
      resource: p.resource as Resource,
      canView: p.canView,
      canCreate: p.canCreate,
      canEdit: p.canEdit,
      canDelete: p.canDelete,
    })),
  }));
}

export async function getCurrentUserPermissions() {
  await headers();
  const { getCurrentUser } = await import('@/features/auth/lib/current-user');
  const user = await getCurrentUser();

  if (!user) {
    return { roles: [], permissions: [] as MergedPermission[], overrides: [] as PermissionOverrideSummary[], isSuperAdmin: false };
  }

  const rolesWithPerms = await getUserRolesWithPermissions(user.id);
  const allPermissions = rolesWithPerms.flatMap((r) => r.permissions);
  const overrides = await getUserPermissionOverrides(user.id);
  const merged = applyPermissionOverrides(mergePermissions(allPermissions), overrides);

  return {
    roles: rolesWithPerms,
    permissions: merged,
    overrides,
    isSuperAdmin: rolesWithPerms.some((r) => r.slug === 'super_admin'),
  };
}

export async function getUserEffectivePermissions(userId: string) {
  const [roles, overrides, superAdmin] = await Promise.all([
    getUserRolesWithPermissions(userId),
    getUserPermissionOverrides(userId),
    isSuperAdmin(userId),
  ]);

  const basePermissions = mergePermissions(roles.flatMap((role) => role.permissions));
  const effectivePermissions = superAdmin
    ? basePermissions
    : applyPermissionOverrides(basePermissions, overrides);

  return {
    roles,
    overrides,
    isSuperAdmin: superAdmin,
    basePermissions,
    effectivePermissions,
  };
}

export function canViewResource(perms: MergedPermission[], resource: Resource): boolean {
  return perms.find((p) => p.resource === resource)?.canView ?? false;
}

export function canCreateResource(perms: MergedPermission[], resource: Resource): boolean {
  return perms.find((p) => p.resource === resource)?.canCreate ?? false;
}

export function canEditResource(perms: MergedPermission[], resource: Resource): boolean {
  return perms.find((p) => p.resource === resource)?.canEdit ?? false;
}

export function canDeleteResource(perms: MergedPermission[], resource: Resource): boolean {
  return perms.find((p) => p.resource === resource)?.canDelete ?? false;
}

export const ADMIN_RESOURCE_MAP: Record<string, Resource> = {
  '/admin': 'dashboard',
  '/admin/users': 'users',
  '/admin/businesses': 'businesses',
  '/admin/introductions': 'introductions',
  '/admin/cards': 'cards',
  '/admin/categories': 'categories',
  '/admin/countries': 'countries',
  '/admin/cities': 'cities',
  '/admin/stripe-links': 'stripe-links',
  '/admin/subscriptions': 'subscriptions',
  '/admin/memberships': 'memberships',
  '/admin/catalog': 'catalog',
  '/admin/audit': 'audit',
  '/admin/roles': 'roles',
};

export function resolveResourceFromPath(pathname: string): Resource | null {
  const sorted = Object.entries(ADMIN_RESOURCE_MAP).sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [prefix, resource] of sorted) {
    if (pathname.startsWith(prefix)) {
      return resource;
    }
  }
  return null;
}
