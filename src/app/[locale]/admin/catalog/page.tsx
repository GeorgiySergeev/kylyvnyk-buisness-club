import { desc, isNull } from 'drizzle-orm';

import type { SupportedLocale } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { catalogItems } from '@/db/schema';
import { AdminPageHeader, AdminPanel } from '@/features/admin/components/admin-ui';
import { CatalogCrud } from '@/features/admin/components/catalog-crud';
import { isUndefinedTableError,MIGRATION_REQUIRED_MESSAGE } from '@/lib/db-guard';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminCatalogPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminCatalogPage({ params }: AdminCatalogPageProps) {
  const { locale } = await params;
  const t = getT('admin', locale);

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
      <AdminPageHeader description={t('catalogDescription')} title={t('navCatalog')} />
      <AdminPanel description={t('catalogPanelDescription')} title={t('catalogPanelTitle')}>
        {migrationRequired ? (
          <p className="text-sm text-ds-warning">{MIGRATION_REQUIRED_MESSAGE}</p>
        ) : null}
        <CatalogCrud
          disabled={migrationRequired}
          labels={{
            archive: t('archive'),
            businessId: t('businessId'),
            create: t('create'),
            save: t('saveShort'),
            slug: t('slug'),
            status: t('status'),
            summary: t('summary'),
            title: t('itemTitle'),
          }}
          rows={rows}
        />
      </AdminPanel>
    </div>
  );
}
