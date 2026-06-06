import assert from 'node:assert/strict';
import { test } from 'vitest';

import { PLATFORM_ROLE_OPTIONS } from '../../../src/features/admin/lib/access-display';
import { canRevokeRoleAssignment } from '../../../src/features/roles/lib/rbac-policy';

test('platform role options do not include VIP membership', () => {
  assert.equal(
    PLATFORM_ROLE_OPTIONS.some((option) => String(option.value) === 'VIP'),
    false,
  );
});

test('platform role options display OWNER as Super Admin', () => {
  assert.equal(
    PLATFORM_ROLE_OPTIONS.find((option) => option.value === 'OWNER')?.label,
    'Super Admin',
  );
});

test('rbac policy blocks revoking the last Super Admin assignment', () => {
  assert.deepEqual(
    canRevokeRoleAssignment({
      isSuperAdminRole: true,
      remainingSuperAdminAssignments: 0,
    }),
    {
      ok: false,
      reason: 'Cannot remove the last Super Admin role assignment.',
    },
  );
});

test('rbac policy allows revoking non-final Super Admin assignment', () => {
  assert.deepEqual(
    canRevokeRoleAssignment({
      isSuperAdminRole: true,
      remainingSuperAdminAssignments: 1,
    }),
    { ok: true },
  );
});

test('rbac policy allows revoking ordinary role assignment', () => {
  assert.deepEqual(
    canRevokeRoleAssignment({
      isSuperAdminRole: false,
      remainingSuperAdminAssignments: 0,
    }),
    { ok: true },
  );
});
