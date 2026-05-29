'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Resource } from '@/db/schema/permission';
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
  const router = useRouter();
  const [permissions, setPermissions] = useState<PermissionRow[]>(initialPermissions);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const result = await updatePermissionsAction({ roleId, permissions });
    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    router.refresh();
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
        onClick={handleSave}
        disabled={saving}
        className="bg-foreground text-background hover:bg-foreground/90"
      >
        {saving ? 'Saving...' : 'Save Permissions'}
      </Button>
    </div>
  );
}
