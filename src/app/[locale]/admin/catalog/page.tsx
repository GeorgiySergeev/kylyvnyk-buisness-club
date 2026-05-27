import type { SupportedLocale } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { AdminPageHeader, AdminPanel } from '@/features/admin/components/admin-ui';
import { CatalogCrud } from '@/features/admin/components/catalog-crud';

export const dynamic = 'force-dynamic';

interface AdminCatalogPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminCatalogPage({ params }: AdminCatalogPageProps) {
  await params;

  const rows = await db.query.catalogItems.findMany({
    columns: { businessId: true, id: true, slug: true, status: true, summary: true, title: true },
    orderBy: (catalogItems, { desc }) => [desc(catalogItems.createdAt)],
    where: (catalogItems, { isNull }) => isNull(catalogItems.deletedAt),
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader description="Manage catalog entries linked to businesses." title="Catalog" />
      <AdminPanel description="Create, update, and archive catalog entries." title="Catalog items">
        <CatalogCrud rows={rows} />
      </AdminPanel>
    </div>
  );
}
