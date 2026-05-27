import type { SupportedLocale } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { AdminPageHeader, AdminPanel } from '@/features/admin/components/admin-ui';
import { MembershipsCrud } from '@/features/admin/components/memberships-crud';

export const dynamic = 'force-dynamic';

interface AdminMembershipsPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminMembershipsPage({ params }: AdminMembershipsPageProps) {
  await params;

  const rows = await db.query.memberships.findMany({
    columns: { endsAt: true, id: true, planCode: true, startsAt: true, status: true, userId: true },
    orderBy: (memberships, { desc }) => [desc(memberships.createdAt)],
    where: (memberships, { isNull }) => isNull(memberships.deletedAt),
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader description="Manage membership access states." title="Memberships" />
      <AdminPanel description="Create, update, and disable membership records." title="Membership records">
        <MembershipsCrud
          rows={rows.map((row) => ({
            endsAt: row.endsAt ? row.endsAt.toISOString().slice(0, 16) : null,
            id: row.id,
            planCode: row.planCode,
            startsAt: row.startsAt.toISOString().slice(0, 16),
            status: row.status,
            userId: row.userId,
          }))}
        />
      </AdminPanel>
    </div>
  );
}
