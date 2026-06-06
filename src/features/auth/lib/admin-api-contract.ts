import type { AdminApiErrorCode } from './admin-access';

export interface AdminApiErrorBody {
  error: {
    code: AdminApiErrorCode;
    message: string;
  };
  ok: false;
}

export interface AdminSessionSuccessBody {
  data: {
    role: 'ADMIN';
    userId: string;
  };
  ok: true;
}

export function createAdminApiErrorBody(
  code: AdminApiErrorCode,
  message: string,
): AdminApiErrorBody {
  return {
    error: { code, message },
    ok: false,
  };
}

export function createAdminSessionSuccessBody(userId: string): AdminSessionSuccessBody {
  return {
    data: {
      role: 'ADMIN',
      userId,
    },
    ok: true,
  };
}
