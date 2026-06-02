import type { PermissionAction, Resource } from '@/db/schema/permission';

export const PLATFORM_ROLE_OPTIONS = [
  { value: 'GUEST', label: 'Guest' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'OWNER', label: 'Super Admin' },
] as const;

export const MEMBERSHIP_OPTIONS = [
  { value: 'FREE', label: 'Free' },
  { value: 'VIP', label: 'VIP' },
  { value: 'BUSINESS', label: 'Business' },
] as const;

export const PERMISSION_ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete'];

export interface PermissionSummaryRow {
  resource: Resource;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function formatPlatformRole(role: string) {
  return PLATFORM_ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;
}

export function summarizePermissionRows(rows: PermissionSummaryRow[]) {
  const granted = rows.filter((row) => row.canView || row.canCreate || row.canEdit || row.canDelete);

  if (granted.length === 0) {
    return 'No direct permissions';
  }

  return granted
    .slice(0, 3)
    .map((row) => {
      const actions = PERMISSION_ACTIONS.filter((action) => {
        if (action === 'view') return row.canView;
        if (action === 'create') return row.canCreate;
        if (action === 'edit') return row.canEdit;
        return row.canDelete;
      }).join('/');

      return `${row.resource}: ${actions}`;
    })
    .join('; ');
}

