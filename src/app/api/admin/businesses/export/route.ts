import { NextResponse } from 'next/server';

import { businessesToCsv,fetchAdminBusinesses } from '@/features/admin/lib/businesses-list';
import { decideAdminApiResult } from '@/features/auth/lib/admin-access';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { hasVerifiedMfaInSession } from '@/features/auth/lib/mfa';
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
  const q = searchParams.get('q') ?? undefined;
  const status = searchParams.get('status') ?? undefined;

  const allBusinesses = await fetchAdminBusinesses();
  let filtered = allBusinesses;

  if (status) {
    filtered = filtered.filter((b) => b.status === status);
  }

  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (b) => b.name.toLowerCase().includes(lower) || b.slug.toLowerCase().includes(lower),
    );
  }

  const csv = businessesToCsv(filtered);
  const exportedAt = new Date().toISOString().slice(0, 10);

  await createAuditLog({
    action: 'ADMIN_BUSINESSES_EXPORTED',
    actorUserId: userResult.data.id,
    entityType: 'business',
    payload: {
      count: filtered.length,
      filters: { q, status },
    },
  });

  return new NextResponse(csv, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Disposition': `attachment; filename="businesses-export-${exportedAt}.csv"`,
      'Content-Type': 'text/csv; charset=utf-8',
    },
  });
}
