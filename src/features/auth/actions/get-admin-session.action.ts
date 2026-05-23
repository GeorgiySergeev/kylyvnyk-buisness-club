'use server';

import { getCurrentUserWithRole } from '../lib/current-user';
import { hasVerifiedMfaInSession } from '../lib/mfa';

type AdminSessionErrorCode = 'FORBIDDEN' | 'MFA_REQUIRED' | 'UNAUTHORIZED';

type AdminSessionResult =
  | {
      data: {
        role: 'ADMIN';
        userId: string;
      };
      ok: true;
    }
  | {
      error: {
        code: AdminSessionErrorCode;
        message: string;
      };
      ok: false;
    };

export async function getAdminSessionAction(): Promise<AdminSessionResult> {
  const userResult = await getCurrentUserWithRole('ADMIN');

  if (!userResult.ok) {
    return userResult.error === 'UNAUTHORIZED'
      ? {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required.',
          },
          ok: false,
        }
      : {
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required.',
          },
          ok: false,
        };
  }

  const hasMfa = await hasVerifiedMfaInSession();

  if (!hasMfa) {
    return {
      error: {
        code: 'MFA_REQUIRED',
        message: 'Admin MFA must be verified in the active session.',
      },
      ok: false,
    };
  }

  return {
    data: {
      role: 'ADMIN',
      userId: userResult.data.id,
    },
    ok: true,
  };
}

