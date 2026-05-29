import 'server-only';

import { and, eq, inArray, or } from 'drizzle-orm';
import { headers } from 'next/headers';

import { db } from '@/db/client';
import { permissions, RESOURCES } from '@/db/schema';
import type { PermissionAction, Resource } from '@/db/schema/permission';

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

interface MergedPermission {
  resource: Resource;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

function mergePermissions(allPerms: { resource: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }[]): MergedPermission[] {
  const merged = new Map<string, MergedPermission>();
  for (const r of RESOURCES) {
    merged.set(r, { resource: r, canView: false, canCreate: false, canEdit: false, canDelete: false });
  }
  for (const p of allPerms) {
    const existing = merged.get(p.resource);
    if (existing) {
      existing.canView = existing.canView || p.canView;
      existing.canCreate = existing.canCreate || p.canCreate;
      existing.canEdit = existing.canEdit || p.canEdit;
      existing.canDelete = existing.canDelete || p.canDelete;
    }
  }
  return Array.from(merged.values());
}

async function getRoleIdsForUser(userId: string): Promise<string[]> {
  const userRoleAssignments = await db.query.userRoles.findMany({
    where: (table, { eq }) => eq(table.userId, userId),
    columns: { roleId: true },
  });
  return userRoleAssignments.map((a) => a.roleId);
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

  return perms.length > 0;
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
    return { roles: [], permissions: [] as MergedPermission[], isSuperAdmin: false };
  }

  const rolesWithPerms = await getUserRolesWithPermissions(user.id);
  const allPermissions = rolesWithPerms.flatMap((r) => r.permissions);
  const merged = mergePermissions(allPermissions);

  return {
    roles: rolesWithPerms,
    permissions: merged,
    isSuperAdmin: rolesWithPerms.some((r) => r.slug === 'super_admin'),
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
