import { NextResponse } from 'next/server';

import { decideAdminApiResult } from '@/features/auth/lib/admin-access';
import {
  createAdminApiErrorBody,
  createAdminSessionSuccessBody,
} from '@/features/auth/lib/admin-api-contract';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { hasVerifiedMfaInSession } from '@/features/auth/lib/mfa';

function errorResponse(code: 'FORBIDDEN' | 'MFA_REQUIRED' | 'SUPER_ADMIN_REQUIRED' | 'UNAUTHORIZED', message: string, status: 401 | 403) {
  return NextResponse.json(createAdminApiErrorBody(code, message), { status });
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

  return NextResponse.json(createAdminSessionSuccessBody(userResult.data.id));
}
