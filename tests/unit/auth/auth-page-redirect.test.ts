import { describe, expect, it } from 'vitest';

import { resolveAuthenticatedAuthPageRedirectPath } from '../../../src/features/auth/lib/auth-page-redirect';

describe('authenticated auth page redirect', () => {
  it('sends incomplete onboarding to onboarding', () => {
    const target = resolveAuthenticatedAuthPageRedirectPath({
      hasMfa: true,
      onboardingComplete: false,
      role: 'ADMIN',
    });

    expect(target).toBe('/m/onboarding');
  });

  it('sends members to the dashboard', () => {
    const target = resolveAuthenticatedAuthPageRedirectPath({
      hasMfa: false,
      onboardingComplete: true,
      role: 'MEMBER',
    });

    expect(target).toBe('/m/dashboard');
  });

  it('sends admins without MFA to the 2FA-required page', () => {
    const target = resolveAuthenticatedAuthPageRedirectPath({
      hasMfa: false,
      onboardingComplete: true,
      role: 'ADMIN',
    });

    expect(target).toBe('/m/2fa-required');
  });

  it('sends owners with MFA to admin', () => {
    const target = resolveAuthenticatedAuthPageRedirectPath({
      hasMfa: true,
      onboardingComplete: true,
      role: 'OWNER',
    });

    expect(target).toBe('/admin');
  });
});
