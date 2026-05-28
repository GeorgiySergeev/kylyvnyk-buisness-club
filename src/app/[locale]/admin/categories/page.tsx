import { asc, isNull } from 'drizzle-orm';

import type { SupportedLocale } from '@/components/layout/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { db } from '@/db/client';
import { businesses, categories } from '@/db/schema';
import {
  AdminDataTableShell,
  AdminEmptyState,
  AdminPageHeader,
} from '@/features/admin/components/admin-ui';
import { CategoriesCrud } from '@/features/admin/components/categories-crud';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminCategoriesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminCategoriesPage({ params }: AdminCategoriesPageProps) {
  const { locale } = await params;
  const t = getT('admin', locale);

  type CategoryRow = {
    icon: string | null;
    id: number;
    name: string;
    parentId: number | null;
    slug: string;
  };
  type BusinessCategoryRef = {
    categoryId: number | null;
  };

  const [categoryRows, businessRows]: [CategoryRow[], BusinessCategoryRef[]] = await Promise.all([
    db.query.categories.findMany({
      columns: {
        icon: true,
        id: true,
        name: true,
        parentId: true,
        slug: true,
      },
      orderBy: [asc(categories.name)],
    }),
    db.query.businesses.findMany({
      columns: {
        categoryId: true,
      },
      where: isNull(businesses.deletedAt),
    }),
  ]);

  const categoryNamesById = new Map(categoryRows.map((category) => [category.id, category.name]));
  const businessCountsByCategory = businessRows.reduce<Map<number, number>>((counts, business) => {
    if (business.categoryId === null) return counts;
    counts.set(business.categoryId, (counts.get(business.categoryId) ?? 0) + 1);
    return counts;
  }, new Map());

  return (
    <div className="space-y-5">
      <AdminPageHeader description={t('categoriesDescription')} title={t('categoriesTitle')} />

      <CategoriesCrud
        labels={{
          create: t('create'),
          delete: t('delete'),
          icon: t('categoryIcon'),
          name: t('categoryName'),
          parentId: t('parentId'),
          save: t('saveShort'),
          slug: t('slug'),
        }}
        rows={categoryRows.map((category) => ({
          ...category,
          linkedBusinesses: businessCountsByCategory.get(category.id) ?? 0,
        }))}
      />

      {categoryRows.length === 0 ? (
        <AdminEmptyState description={t('noCategoriesDescription')} title={t('noCategories')} />
      ) : (
        <AdminDataTableShell>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t('categoryName')}</TableHead>
                <TableHead>{t('slug')}</TableHead>
                <TableHead>{t('categoryParent')}</TableHead>
                <TableHead>{t('categoryIcon')}</TableHead>
                <TableHead className="text-right">{t('linkedBusinesses')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryRows.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium text-foreground">{category.name}</TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {category.slug}
                  </TableCell>
                  <TableCell>
                    {category.parentId
                      ? (categoryNamesById.get(category.parentId) ?? t('emptyValue'))
                      : t('emptyValue')}
                  </TableCell>
                  <TableCell>{category.icon ?? t('emptyValue')}</TableCell>
                  <TableCell className="text-right">
                    {businessCountsByCategory.get(category.id) ?? 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminDataTableShell>
      )}
    </div>
  );
}
