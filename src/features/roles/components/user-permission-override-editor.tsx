'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Resource } from '@/db/schema/permission';
import { RESOURCES } from '@/db/schema/permission';
import { useAdminMutation } from '@/features/admin/hooks/use-admin-mutation';
import { updateUserPermissionOverridesAction } from '@/features/roles/actions';

import { RolePermissionMatrix } from './role-permission-matrix';

interface OverrideRow {
  resource: Resource;
  denyView: boolean;
  denyCreate: boolean;
  denyEdit: boolean;
  denyDelete: boolean;
}

interface UserPermissionOverrideEditorProps {
  userId: string;
  overrides: OverrideRow[];
}

function toPermissionRows(overrides: OverrideRow[]) {
  return RESOURCES.map((resource) => {
    const current = overrides.find((override) => override.resource === resource);

    return {
      resource,
      canView: current?.denyView ?? false,
      canCreate: current?.denyCreate ?? false,
      canEdit: current?.denyEdit ?? false,
      canDelete: current?.denyDelete ?? false,
    };
  });
}

export function UserPermissionOverrideEditor({
  userId,
  overrides,
}: UserPermissionOverrideEditorProps) {
  const { pending, refresh, run } = useAdminMutation();
  const [rows, setRows] = useState(toPermissionRows(overrides));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setError(null);
    setSuccess(false);

    const result = await run(() =>
      updateUserPermissionOverridesAction({
        userId,
        overrides: rows.map((row) => ({
          resource: row.resource,
          denyView: row.canView,
          denyCreate: row.canCreate,
          denyEdit: row.canEdit,
          denyDelete: row.canDelete,
        })),
      }),
    );

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    refresh();
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
          User restrictions saved successfully.
        </div>
      ) : null}

      <RolePermissionMatrix
        initialPermissions={rows}
        labels={{
          resource: 'Resource',
          canView: 'Deny view',
          canCreate: 'Deny create',
          canEdit: 'Deny edit',
          canDelete: 'Deny delete',
        }}
        onChange={setRows}
      />

      <Button
        className="bg-foreground text-background hover:bg-foreground/90"
        disabled={pending}
        onClick={() => {
          void handleSave();
        }}
      >
        {pending ? 'Saving...' : 'Save Restrictions'}
      </Button>
    </div>
  );
}
