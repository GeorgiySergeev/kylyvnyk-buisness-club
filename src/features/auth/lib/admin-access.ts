export type AdminApiErrorCode = 'FORBIDDEN' | 'MFA_REQUIRED' | 'UNAUTHORIZED';
export type AdminRouteDecision = 'ALLOW' | 'REDIRECT_HOME' | 'REDIRECT_MFA' | 'REDIRECT_SIGN_IN';

export function decideAdminRouteAccess(input: {
  hasMfa: boolean;
  isAuthenticated: boolean;
  role: 'ADMIN' | 'GUEST' | 'MANAGER' | 'MEMBER' | 'OWNER' | null;
}): AdminRouteDecision {
  if (!input.isAuthenticated) {
    return 'REDIRECT_SIGN_IN';
  }

  if (input.role !== 'ADMIN' && input.role !== 'OWNER') {
    return 'REDIRECT_HOME';
  }

  if (!input.hasMfa) {
    return 'REDIRECT_MFA';
  }

  return 'ALLOW';
}

export function decideAdminApiResult(input: {
  hasMfa: boolean;
  roleCheck: 'FORBIDDEN' | 'OK' | 'UNAUTHORIZED';
}):
  | { ok: true }
  | {
      code: AdminApiErrorCode;
      message: string;
      ok: false;
      status: 401 | 403;
    } {
  if (input.roleCheck === 'UNAUTHORIZED') {
    return {
      code: 'UNAUTHORIZED',
      message: 'Authentication required.',
      ok: false,
      status: 401,
    };
  }

  if (input.roleCheck === 'FORBIDDEN') {
    return {
      code: 'FORBIDDEN',
      message: 'Admin access required.',
      ok: false,
      status: 403,
    };
  }

  if (!input.hasMfa) {
    return {
      code: 'MFA_REQUIRED',
      message: 'Admin MFA must be verified in the active session.',
      ok: false,
      status: 403,
    };
  }

  return { ok: true };
}
