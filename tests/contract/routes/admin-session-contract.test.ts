import { describe, expect, it } from 'vitest';

import {
  createAdminApiErrorBody,
  createAdminSessionSuccessBody,
} from '../../../src/features/auth/lib/admin-api-contract';

describe('admin session contract', () => {
  it('returns a minimal error payload with a stable key set', () => {
    const body = createAdminApiErrorBody(
      'MFA_REQUIRED',
      'Admin MFA must be verified in the active session.',
    );

    expect(Object.keys(body).sort()).toEqual(['error', 'ok']);
    expect(Object.keys(body.error).sort()).toEqual(['code', 'message']);
    expect(body).toEqual({
      error: {
        code: 'MFA_REQUIRED',
        message: 'Admin MFA must be verified in the active session.',
      },
      ok: false,
    });
  });

  it('returns only role and userId in the success payload', () => {
    const body = createAdminSessionSuccessBody('user-123');

    expect(Object.keys(body).sort()).toEqual(['data', 'ok']);
    expect(Object.keys(body.data).sort()).toEqual(['role', 'userId']);
    expect(body).toEqual({
      data: {
        role: 'ADMIN',
        userId: 'user-123',
      },
      ok: true,
    });
  });
});
