import type { UserRole } from '../../../db/schema/enums/user-role';

export type AuthenticatedAuthPageTarget =
  | '/admin'
  | '/m/2fa-required'
  | '/m/dashboard'
  | '/m/onboarding';

export function resolveAuthenticatedAuthPageRedirectPath(input: {
  hasMfa: boolean;
  onboardingComplete: boolean;
  role: UserRole;
}): AuthenticatedAuthPageTarget {
  if (!input.onboardingComplete) {
    return '/m/onboarding';
  }

  if (input.role === 'ADMIN' || input.role === 'OWNER') {
    return input.hasMfa ? '/admin' : '/m/2fa-required';
  }

  return '/m/dashboard';
}
