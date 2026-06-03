import assert from 'node:assert/strict';
import test from 'node:test';

import { applyPermissionOverrides } from '../../src/lib/auth/permission-override-helpers';

test('permission overrides remove only the denied actions from granted permissions', () => {
  const effective = applyPermissionOverrides(
    [
      {
        resource: 'users',
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
      },
      {
        resource: 'roles',
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
    ],
    [
      {
        resource: 'users',
        denyView: false,
        denyCreate: true,
        denyEdit: true,
        denyDelete: false,
      },
    ],
  );

  assert.deepEqual(effective, [
    {
      resource: 'users',
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    {
      resource: 'roles',
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  ]);
});
