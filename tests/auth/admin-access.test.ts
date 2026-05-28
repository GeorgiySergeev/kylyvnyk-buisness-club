import assert from 'node:assert/strict';
import test from 'node:test';

import {
  decideAdminApiResult,
  decideAdminRouteAccess,
} from '../../src/features/auth/lib/admin-access';

test('admin route decision: anonymous is redirected to sign-in', () => {
  const decision = decideAdminRouteAccess({
    hasMfa: false,
    isAuthenticated: false,
    role: null,
  });

  assert.equal(decision, 'REDIRECT_SIGN_IN');
});

test('admin route decision: non-admin is redirected home', () => {
  const decision = decideAdminRouteAccess({
    hasMfa: true,
    isAuthenticated: true,
    role: 'MEMBER',
  });

  assert.equal(decision, 'REDIRECT_HOME');
});

test('admin route decision: admin without MFA is redirected to MFA page', () => {
  const decision = decideAdminRouteAccess({
    hasMfa: false,
    isAuthenticated: true,
    role: 'ADMIN',
  });

  assert.equal(decision, 'REDIRECT_MFA');
});

test('admin route decision: admin with MFA is allowed', () => {
  const decision = decideAdminRouteAccess({
    hasMfa: true,
    isAuthenticated: true,
    role: 'ADMIN',
  });

  assert.equal(decision, 'ALLOW');
});

test('admin API decision: unauthorized maps to 401 contract', () => {
  const result = decideAdminApiResult({
    hasMfa: false,
    roleCheck: 'UNAUTHORIZED',
  });

  assert.deepEqual(result, {
    code: 'UNAUTHORIZED',
    message: 'Authentication required.',
    ok: false,
    status: 401,
  });
});

test('admin API decision: forbidden maps to 403 contract', () => {
  const result = decideAdminApiResult({
    hasMfa: false,
    roleCheck: 'FORBIDDEN',
  });

  assert.deepEqual(result, {
    code: 'FORBIDDEN',
    message: 'Admin access required.',
    ok: false,
    status: 403,
  });
});

test('admin API decision: admin without MFA returns MFA_REQUIRED contract', () => {
  const result = decideAdminApiResult({
    hasMfa: false,
    roleCheck: 'OK',
  });

  assert.deepEqual(result, {
    code: 'MFA_REQUIRED',
    message: 'Admin MFA must be verified in the active session.',
    ok: false,
    status: 403,
  });
});

test('admin API decision: admin with MFA returns ok', () => {
  const result = decideAdminApiResult({
    hasMfa: true,
    roleCheck: 'OK',
  });

  assert.deepEqual(result, { ok: true });
});
