'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Resource } from '@/db/schema/permission';
import { useAdminMutation } from '@/features/admin/hooks/use-admin-mutation';
import { updatePermissionsAction } from '@/features/roles/actions';

import { RolePermissionMatrix } from './role-permission-matrix';

interface PermissionRow {
  resource: Resource;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface RolePermissionEditorProps {
  roleId: string;
  initialPermissions: PermissionRow[];
  labels: {
    resource: string;
    canView: string;
    canCreate: string;
    canEdit: string;
    canDelete: string;
  };
}

export function RolePermissionEditor({ roleId, initialPermissions, labels }: RolePermissionEditorProps) {
  const { pending, refresh, run } = useAdminMutation();
  const [permissions, setPermissions] = useState<PermissionRow[]>(initialPermissions);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setError(null);
    setSuccess(false);

    const result = await run(() => updatePermissionsAction({ roleId, permissions }));
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    refresh();
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
          Permissions saved successfully.
        </div>
      )}

      <RolePermissionMatrix
        initialPermissions={permissions}
        onChange={setPermissions}
        labels={labels}
      />

      <Button
        className="bg-foreground text-background hover:bg-foreground/90"
        disabled={pending}
        onClick={() => {
          void handleSave();
        }}
      >
        {pending ? 'Saving...' : 'Save Permissions'}
      </Button>
    </div>
  );
}
