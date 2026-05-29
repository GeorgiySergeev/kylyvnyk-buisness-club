'use client';

import type { ReactNode } from 'react';

import type { PermissionAction, Resource } from '@/db/schema/permission';

interface PermissionGateProps {
  resource: Resource;
  action: PermissionAction;
  permissions: {
    resource: Resource;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  }[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({
  resource,
  action,
  permissions,
  children,
  fallback = null,
}: PermissionGateProps) {
  const perm = permissions.find((p) => p.resource === resource);

  const allowed =
    perm &&
    (action === 'view'
      ? perm.canView
      : action === 'create'
        ? perm.canCreate
        : action === 'edit'
          ? perm.canEdit
          : perm.canDelete);

  if (!allowed) return fallback;
  return <>{children}</>;
}
