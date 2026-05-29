'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { assignRoleAction, revokeRoleAction } from '@/features/roles/actions';

interface UserRoleAssignmentProps {
  userId: string;
  currentRoles: {
    id: string;
    roleId: string;
    roleName: string;
    roleSlug: string;
    isSystem: boolean;
  }[];
  availableRoles: {
    id: string;
    name: string;
    slug: string;
    isSystem: boolean;
  }[];
}

export function UserRoleAssignment({
  userId,
  currentRoles,
  availableRoles,
}: UserRoleAssignmentProps) {
  const router = useRouter();
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const unassignedRoles = availableRoles.filter(
    (r) => !currentRoles.some((cr) => cr.roleId === r.id),
  );

  async function handleAssign() {
    if (!selectedRoleId) return;
    setPending(true);
    setError(null);

    const result = await assignRoleAction({ userId, roleId: selectedRoleId });
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    setSelectedRoleId('');
    setPending(false);
    router.refresh();
  }

  async function handleRevoke(roleId: string) {
    setPending(true);
    setError(null);

    const result = await revokeRoleAction({ userId, roleId });
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    setPending(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Current Roles</label>
        <div className="flex flex-wrap gap-2">
          {currentRoles.length === 0 ? (
            <span className="text-sm text-muted-foreground">No roles assigned</span>
          ) : (
            currentRoles.map((role) => (
              <Badge key={role.roleId} variant="secondary" className="gap-1.5 pl-2 pr-1">
                <span>{role.roleName}</span>
                {role.roleSlug !== 'super_admin' ? (
                  <button
                    type="button"
                    onClick={() => handleRevoke(role.roleId)}
                    disabled={pending}
                    className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                    aria-label={`Remove ${role.roleName} role`}
                  >
                    ×
                  </button>
                ) : null}
              </Badge>
            ))
          )}
        </div>
      </div>

      {unassignedRoles.length > 0 ? (
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1.5">
            <label htmlFor="assign-role-select" className="text-sm font-medium text-foreground">
              Assign New Role
            </label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger id="assign-role-select" className="h-9">
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                {unassignedRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAssign}
            disabled={!selectedRoleId || pending}
            size="sm"
            className="h-9 bg-foreground text-background hover:bg-foreground/90"
          >
            Assign
          </Button>
        </div>
      ) : null}
    </div>
  );
}
