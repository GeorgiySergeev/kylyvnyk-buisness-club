'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAdminMutation } from '@/features/admin/hooks/use-admin-mutation';
import type { PermissionSummaryRow } from '@/features/admin/lib/access-display';
import { summarizePermissionRows } from '@/features/admin/lib/access-display';
import { assignRoleAction, revokeRoleAction } from '@/features/roles/actions';

interface RoleOption {
  description: string | null;
  id: string;
  isSystem: boolean;
  name: string;
  permissions: PermissionSummaryRow[];
  slug: string;
}

interface CurrentRole {
  description: string | null;
  id: string;
  isSystem: boolean;
  permissions: PermissionSummaryRow[];
  roleId: string;
  roleName: string;
  roleSlug: string;
}

interface UserRoleAssignmentProps {
  availableRoles: RoleOption[];
  currentRoles: CurrentRole[];
  userId: string;
}

export function UserRoleAssignment({
  availableRoles,
  currentRoles,
  userId,
}: UserRoleAssignmentProps) {
  const { pending, refresh, run } = useAdminMutation();
  const [error, setError] = useState<string | null>(null);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  async function handleToggle(roleId: string, assigned: boolean) {
    setError(null);
    setSavingRoleId(roleId);

    const result = assigned
      ? await run(() => revokeRoleAction({ roleId, userId }))
      : await run(() => assignRoleAction({ roleId, userId }));

    setSavingRoleId(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    refresh();
  }

  const effectivePermissions = mergeEffectivePermissions(
    currentRoles.flatMap((role) => role.permissions),
  );

  return (
    <div className="space-y-5">
      {error ? (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Assigned RBAC roles</p>
        <div className="flex flex-wrap gap-2">
          {currentRoles.length === 0 ? (
            <span className="text-sm text-muted-foreground">No roles assigned</span>
          ) : (
            currentRoles.map((role) => (
              <Badge className="bg-cyan-400/10 text-cyan-300" key={role.roleId}>
                {role.roleName}
              </Badge>
            ))
          )}
        </div>
      </div>

      <div className="space-y-3">
        {availableRoles.map((role) => {
          const assigned = currentRoles.some((currentRole) => currentRole.roleId === role.id);
          const busy = pending && savingRoleId === role.id;

          return (
            <label
              className="flex min-h-14 items-start gap-3 rounded-md border border-ds-border bg-ds-bg/40 px-3 py-3 transition-colors hover:border-cyan-400/40"
              key={role.id}
            >
              <Checkbox
                aria-label={`${assigned ? 'Remove' : 'Assign'} ${role.name}`}
                checked={assigned}
                disabled={pending}
                onCheckedChange={() => {
                  void handleToggle(role.id, assigned);
                }}
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{role.name}</span>
                  {role.isSystem ? (
                    <Badge className="bg-cyan-400/10 text-cyan-300">System</Badge>
                  ) : null}
                  {busy ? <span className="text-xs text-muted-foreground">Saving...</span> : null}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {role.description || summarizePermissionRows(role.permissions)}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <div className="space-y-2 rounded-md border border-ds-border bg-ds-bg/40 p-3">
        <p className="text-sm font-medium text-foreground">Effective Access Summary</p>
        {effectivePermissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No admin resource permissions granted.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {effectivePermissions.map((permission) => (
              <div
                className="flex items-center justify-between gap-3 text-xs"
                key={permission.resource}
              >
                <span className="font-medium text-foreground">{permission.resource}</span>
                <span className="text-right text-muted-foreground">
                  {summarizePermissionRows([permission]).replace(`${permission.resource}: `, '')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function mergeEffectivePermissions(rows: PermissionSummaryRow[]) {
  const merged = new Map<string, PermissionSummaryRow>();

  rows.forEach((row) => {
    const existing = merged.get(row.resource) ?? {
      canCreate: false,
      canDelete: false,
      canEdit: false,
      canView: false,
      resource: row.resource,
    };

    existing.canView = existing.canView || row.canView;
    existing.canCreate = existing.canCreate || row.canCreate;
    existing.canEdit = existing.canEdit || row.canEdit;
    existing.canDelete = existing.canDelete || row.canDelete;
    merged.set(row.resource, existing);
  });

  return Array.from(merged.values()).filter(
    (row) => row.canView || row.canCreate || row.canEdit || row.canDelete,
  );
}
