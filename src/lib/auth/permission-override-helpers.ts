import { RESOURCES } from '@/db/schema/permission';
import type { Resource } from '@/db/schema/permission';

export interface MergedPermission {
  resource: Resource;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface PermissionOverrideSummary {
  resource: Resource;
  denyView: boolean;
  denyCreate: boolean;
  denyEdit: boolean;
  denyDelete: boolean;
}

export function mergePermissions(
  allPerms: Array<{
    resource: Resource | string;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  }>,
): MergedPermission[] {
  const merged = new Map<Resource, MergedPermission>();

  for (const resource of RESOURCES) {
    merged.set(resource, {
      resource,
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    });
  }

  for (const permission of allPerms) {
    const resource = permission.resource as Resource;
    const existing = merged.get(resource);

    if (!existing) {
      continue;
    }

    existing.canView = existing.canView || permission.canView;
    existing.canCreate = existing.canCreate || permission.canCreate;
    existing.canEdit = existing.canEdit || permission.canEdit;
    existing.canDelete = existing.canDelete || permission.canDelete;
  }

  return Array.from(merged.values());
}

export function applyPermissionOverrides(
  permissionsList: MergedPermission[],
  overrides: PermissionOverrideSummary[],
): MergedPermission[] {
  if (overrides.length === 0) {
    return permissionsList;
  }

  const overrideMap = new Map(overrides.map((override) => [override.resource, override]));

  return permissionsList.map((permission) => {
    const override = overrideMap.get(permission.resource);

    if (!override) {
      return permission;
    }

    return {
      resource: permission.resource,
      canView: override.denyView ? false : permission.canView,
      canCreate: override.denyCreate ? false : permission.canCreate,
      canEdit: override.denyEdit ? false : permission.canEdit,
      canDelete: override.denyDelete ? false : permission.canDelete,
    };
  });
}
