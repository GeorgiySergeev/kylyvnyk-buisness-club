import { desc, isNull } from 'drizzle-orm';

import type { SupportedLocale } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { catalogItems } from '@/db/schema';
import { AdminPageHeader, AdminPanel } from '@/features/admin/components/admin-ui';
import { CatalogCrud } from '@/features/admin/components/catalog-crud';
import { isUndefinedTableError,MIGRATION_REQUIRED_MESSAGE } from '@/lib/db-guard';

export const dynamic = 'force-dynamic';

interface AdminCatalogPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminCatalogPage({ params }: AdminCatalogPageProps) {
  await params;

  let rows: Array<{
    businessId: string;
    id: string;
    slug: string;
    status: string;
    summary: string | null;
    title: string;
  }> = [];
  let migrationRequired = false;
  try {
    rows = await db.query.catalogItems.findMany({
      columns: { businessId: true, id: true, slug: true, status: true, summary: true, title: true },
      orderBy: [desc(catalogItems.createdAt)],
      where: isNull(catalogItems.deletedAt),
    });
  } catch (error) {
    if (isUndefinedTableError(error, 'catalog_items')) {
      migrationRequired = true;
    } else {
      throw error;
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader description="Manage catalog entries linked to businesses." title="Catalog" />
      <AdminPanel description="Create, update, and archive catalog entries." title="Catalog items">
        {migrationRequired ? (
          <p className="text-sm text-amber-300">{MIGRATION_REQUIRED_MESSAGE}</p>
        ) : null}
        <CatalogCrud disabled={migrationRequired} rows={rows} />
      </AdminPanel>
    </div>
  );
}
