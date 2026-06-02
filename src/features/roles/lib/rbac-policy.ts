export function canRevokeRoleAssignment(input: {
  isSuperAdminRole: boolean;
  remainingSuperAdminAssignments: number;
}) {
  if (!input.isSuperAdminRole) {
    return { ok: true as const };
  }

  if (input.remainingSuperAdminAssignments <= 0) {
    return {
      ok: false as const,
      reason: 'Cannot remove the last Super Admin role assignment.',
    };
  }

  return { ok: true as const };
}

