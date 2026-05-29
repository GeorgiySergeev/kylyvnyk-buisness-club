import { NextResponse } from 'next/server';

import { decideAdminApiResult } from '@/features/auth/lib/admin-access';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { hasVerifiedMfaInSession } from '@/features/auth/lib/mfa';

type ApiErrorCode = 'FORBIDDEN' | 'MFA_REQUIRED' | 'SUPER_ADMIN_REQUIRED' | 'UNAUTHORIZED';
type ApiErrorResult = { error: { code: ApiErrorCode; message: string }; ok: false };
type ApiSuccessResult = {
  data: {
    role: 'ADMIN';
    userId: string;
  };
  ok: true;
};

function errorResponse(
  code: ApiErrorCode,
  message: string,
  status: 401 | 403,
) {
  const body: ApiErrorResult = {
    error: { code, message },
    ok: false,
  };

  return NextResponse.json(body, { status });
}

export async function GET() {
  const userResult = await getCurrentUserWithRole('ADMIN');
  if (!userResult.ok) {
    const decision = decideAdminApiResult({
      hasMfa: false,
      roleCheck: userResult.error,
    });

    if (decision.ok) {
      return errorResponse('FORBIDDEN', 'Admin access required.', 403);
    }

    return errorResponse(decision.code, decision.message, decision.status);
  }

  const decision = decideAdminApiResult({
    hasMfa: await hasVerifiedMfaInSession(),
    roleCheck: 'OK',
  });

  if (!decision.ok) {
    return errorResponse(decision.code, decision.message, decision.status);
  }

  const body: ApiSuccessResult = {
    data: {
      role: 'ADMIN',
      userId: userResult.data.id,
    },
    ok: true,
  };

  return NextResponse.json(body);
}
