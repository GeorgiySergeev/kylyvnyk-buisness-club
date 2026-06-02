import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveAuthenticatedAuthPageRedirectPath } from '../../src/features/auth/lib/auth-page-redirect';

test('authenticated auth page redirect: incomplete onboarding goes to onboarding', () => {
  const target = resolveAuthenticatedAuthPageRedirectPath({
    hasMfa: true,
    onboardingComplete: false,
    role: 'ADMIN',
  });

  assert.equal(target, '/m/onboarding');
});

test('authenticated auth page redirect: member goes to dashboard', () => {
  const target = resolveAuthenticatedAuthPageRedirectPath({
    hasMfa: false,
    onboardingComplete: true,
    role: 'MEMBER',
  });

  assert.equal(target, '/m/dashboard');
});

test('authenticated auth page redirect: admin without MFA goes to MFA page', () => {
  const target = resolveAuthenticatedAuthPageRedirectPath({
    hasMfa: false,
    onboardingComplete: true,
    role: 'ADMIN',
  });

  assert.equal(target, '/m/2fa-required');
});

test('authenticated auth page redirect: admin with MFA goes to admin', () => {
  const target = resolveAuthenticatedAuthPageRedirectPath({
    hasMfa: true,
    onboardingComplete: true,
    role: 'ADMIN',
  });

  assert.equal(target, '/admin');
});
