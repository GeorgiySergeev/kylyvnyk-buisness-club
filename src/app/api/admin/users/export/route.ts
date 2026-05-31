import { NextResponse } from 'next/server';

import { decideAdminApiResult } from '@/features/auth/lib/admin-access';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { hasVerifiedMfaInSession } from '@/features/auth/lib/mfa';
import {
  fetchAdminUsers,
  filterAdminUsers,
  usersToCsv,
} from '@/features/admin/lib/users-list';
import { createAuditLog } from '@/lib/audit';

export async function GET(request: Request) {
  const userResult = await getCurrentUserWithRole('ADMIN');

  if (!userResult.ok) {
    const decision = decideAdminApiResult({
      hasMfa: false,
      roleCheck: userResult.error,
    });

    return NextResponse.json(
      { error: decision.ok ? 'Admin access required.' : decision.message, ok: false },
      { status: decision.ok ? 403 : decision.status },
    );
  }

  const decision = decideAdminApiResult({
    hasMfa: await hasVerifiedMfaInSession(),
    roleCheck: 'OK',
  });

  if (!decision.ok) {
    return NextResponse.json({ error: decision.message, ok: false }, { status: decision.status });
  }

  const { searchParams } = new URL(request.url);
  const filters = {
    plan: searchParams.get('plan') ?? undefined,
    q: searchParams.get('q') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  };

  const allUsers = await fetchAdminUsers();
  const filtered = filterAdminUsers(allUsers, filters);
  const csv = usersToCsv(filtered);
  const exportedAt = new Date().toISOString().slice(0, 10);

  await createAuditLog({
    action: 'ADMIN_USERS_EXPORTED',
    actorUserId: userResult.data.id,
    entityType: 'user',
    payload: {
      count: filtered.length,
      filters,
    },
  });

  return new NextResponse(csv, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Disposition': `attachment; filename="users-export-${exportedAt}.csv"`,
      'Content-Type': 'text/csv; charset=utf-8',
    },
  });
}
