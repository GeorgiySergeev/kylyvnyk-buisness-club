import { asc, isNull } from 'drizzle-orm';
import { FolderTree, Layers3, Link2 } from 'lucide-react';
import Link from 'next/link';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  AdminTableActionsCell,
  AdminTableActionsHead,
} from '@/features/admin/components/admin-table-actions';
import {
  AdminDataTableShell,
  AdminEmptyState,
  AdminFiltersBar,
  AdminMetricCard,
  AdminMobileCard,
  AdminPageHeader,
  AdminSearchInput,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { CategoriesPageActions } from '@/features/admin/components/categories-page-actions';
import { CategoryAdminProvider } from '@/features/admin/components/category-admin-provider';
import { CategoryMobileActions } from '@/features/admin/components/category-mobile-actions';
import { CategoryRowActions } from '@/features/admin/components/category-row-actions';
import {
  type AdminCategoryRow,
  buildCategoryDisplayRows,
  type CategoryScopeFilter,
} from '@/features/admin/lib/categories-list';
import { getT } from '@/lib/i18n/t-server';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const SCOPE_FILTERS = ['ALL', 'TOP_LEVEL', 'IN_USE'] as const;

const DEPTH_PADDING: Record<number, string> = {
  0: '',
  1: 'pl-4',
  2: 'pl-8',
  3: 'pl-12',
  4: 'pl-16',
};

interface AdminCategoriesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
  searchParams: Promise<{
    q?: string;
    scope?: string;
  }>;
}

export default async function AdminCategoriesPage({ params, searchParams }: AdminCategoriesPageProps) {
  const { locale } = await params;
  const { q, scope } = await searchParams;
  const t = getT('admin', locale);

  const searchTerm = q?.trim() ?? '';
  const rawScope = scope?.trim() ?? '';
  const scopeFilter: CategoryScopeFilter =
    rawScope === 'TOP_LEVEL' || rawScope === 'IN_USE' ? rawScope : '';

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

  const businessCountsByCategory = businessRows.reduce<Map<number, number>>((counts, business) => {
    if (business.categoryId === null) return counts;
    counts.set(business.categoryId, (counts.get(business.categoryId) ?? 0) + 1);
    return counts;
  }, new Map());

  const childCountsByCategory = categoryRows.reduce<Map<number, number>>((counts, category) => {
    if (category.parentId === null) return counts;
    counts.set(category.parentId, (counts.get(category.parentId) ?? 0) + 1);
    return counts;
  }, new Map());

  const allRows: AdminCategoryRow[] = categoryRows.map((category) => ({
    ...category,
    childCategories: childCountsByCategory.get(category.id) ?? 0,
    linkedBusinesses: businessCountsByCategory.get(category.id) ?? 0,
  }));

  const totalCount = allRows.length;
  const topLevelCount = allRows.filter((row) => row.parentId === null).length;
  const linkedCount = allRows.filter((row) => row.linkedBusinesses > 0).length;

  const displayRows = buildCategoryDisplayRows(allRows, { q: searchTerm, scope: scopeFilter });
  const categoryNamesById = new Map(allRows.map((category) => [category.id, category.name]));

  const dialogLabels = {
    addCategory: t('addCategory'),
    cancel: t('cancel'),
    categoryDeleteBlockedBusinesses: t('categoryDeleteBlockedBusinesses'),
    categoryDeleteBlockedChildren: t('categoryDeleteBlockedChildren'),
    categoryIcon: t('categoryIcon'),
    categoryName: t('categoryName'),
    categoryNoParent: t('categoryNoParent'),
    categoryParent: t('categoryParent'),
    confirmDeleteCategory: t('confirmDeleteCategory'),
    create: t('create'),
    createCategoryDialogTitle: t('createCategoryDialogTitle'),
    delete: t('delete'),
    editCategory: t('editCategory'),
    editCategoryDialogTitle: t('editCategoryDialogTitle'),
    emptyValue: t('emptyValue'),
    saveShort: t('saveShort'),
    slug: t('slug'),
    slugHint: t('slugHint'),
  };

  const basePath = localizeHref(locale, '/admin/categories');

  return (
    <CategoryAdminProvider allRows={allRows} labels={dialogLabels}>
      <div className="space-y-5">
        <AdminPageHeader
          actions={<CategoriesPageActions addCategoryLabel={t('addCategory')} />}
          description={t('categoriesDescription')}
          eyebrow={t('navCatalog')}
          title={t('categoriesTitle')}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminMetricCard
            icon={<FolderTree className="size-4" />}
            label={t('categoriesMetricTotal')}
            meta={t('liveDatabaseSnapshot')}
            value={totalCount}
          />
          <AdminMetricCard
            icon={<Layers3 className="size-4" />}
            label={t('categoriesMetricTopLevel')}
            meta={t('liveDatabaseSnapshot')}
            value={topLevelCount}
          />
          <AdminMetricCard
            icon={<Link2 className="size-4" />}
            label={t('categoriesMetricLinked')}
            meta={t('liveDatabaseSnapshot')}
            tone={linkedCount > 0 ? 'success' : undefined}
            value={linkedCount}
          />
        </div>

        <AdminFiltersBar>
          <form className="flex w-full gap-2 sm:max-w-md" method="GET">
            <AdminSearchInput
              name="q"
              placeholder={t('categoriesSearchPlaceholder')}
              value={searchTerm}
            />
            {scopeFilter ? <input name="scope" type="hidden" value={scopeFilter} /> : null}
            <Button className="h-11 rounded-md" type="submit">
              {t('search')}
            </Button>
          </form>

          <div className="flex flex-wrap gap-1.5">
            {SCOPE_FILTERS.map((item) => {
              const isActive = item === 'ALL' ? !scopeFilter : scopeFilter === item;
              const href =
                item === 'ALL'
                  ? `${basePath}${searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : ''}`
                  : `${basePath}?scope=${item}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''}`;

              const label =
                item === 'ALL'
                  ? t('categoriesFilterAll')
                  : item === 'TOP_LEVEL'
                    ? t('categoriesFilterTopLevel')
                    : t('categoriesFilterInUse');

              return (
                <Button
                  asChild
                  className="h-11 rounded-md"
                  key={item}
                  variant={isActive ? 'default' : 'outline'}
                >
                  <Link href={href}>{label}</Link>
                </Button>
              );
            })}
          </div>
        </AdminFiltersBar>

        {totalCount === 0 ? (
          <AdminEmptyState
            description={t('noCategoriesDescription')}
            title={t('noCategories')}
          />
        ) : displayRows.length === 0 ? (
          <AdminEmptyState title={t('categoriesNoSearchResults')} />
        ) : (
          <>
            <div className="flex flex-col gap-1 rounded-ds-radius-md border border-ds-border bg-ds-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-ds-text-sm font-semibold text-ds-text">{t('categoriesDirectory')}</p>
                <p className="text-ds-text-xs text-ds-text-muted">{t('categoriesDescription')}</p>
              </div>
              <AdminStatusBadge tone="info">
                {displayRows.length} {t('categoriesTitle')}
              </AdminStatusBadge>
            </div>

            <div className="space-y-3 md:hidden">
              {displayRows.map((row) => (
                <AdminMobileCard
                  actions={
                    <CategoryMobileActions
                      deleteLabel={t('delete')}
                      editLabel={t('edit')}
                      row={row}
                    />
                  }
                  badge={
                    row.linkedBusinesses > 0 ? (
                      <Badge variant="secondary">{row.linkedBusinesses}</Badge>
                    ) : undefined
                  }
                  key={row.id}
                  rows={[
                    {
                      label: t('slug'),
                      value: <span className="font-mono text-[11px]">{row.slug}</span>,
                    },
                    {
                      label: t('categoryParent'),
                      value: row.parentId
                        ? (categoryNamesById.get(row.parentId) ?? t('emptyValue'))
                        : t('emptyValue'),
                    },
                    { label: t('linkedBusinesses'), value: row.linkedBusinesses },
                  ]}
                  subtitle={row.slug}
                  title={
                    <span className={cn('inline-flex items-center gap-2', DEPTH_PADDING[row.depth] ?? 'pl-16')}>
                      {row.icon ? <span aria-hidden>{row.icon}</span> : null}
                      {row.name}
                    </span>
                  }
                />
              ))}
            </div>

            <div className="hidden md:block">
              <AdminDataTableShell>
                <Table>
                  <TableHeader>
                    <TableRow className="border-0 bg-ds-surface-2/70 hover:bg-ds-surface-2/70">
                      <TableHead className="text-ds-text-muted">{t('categoryName')}</TableHead>
                      <TableHead className="text-ds-text-muted">{t('slug')}</TableHead>
                      <TableHead className="text-ds-text-muted">{t('categoryParent')}</TableHead>
                      <TableHead className="text-ds-text-muted">{t('linkedBusinesses')}</TableHead>
                      <AdminTableActionsHead label={t('actions')} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayRows.map((row) => (
                      <TableRow className="border-ds-border" key={row.id}>
                        <TableCell>
                          <div
                            className={cn(
                              'flex items-center gap-2',
                              DEPTH_PADDING[row.depth] ?? 'pl-16',
                            )}
                          >
                            {row.icon ? (
                              <span aria-hidden className="text-base leading-none">
                                {row.icon}
                              </span>
                            ) : null}
                            <span className="font-medium text-ds-text">{row.name}</span>
                            {row.childCategories > 0 ? (
                              <Badge className="bg-ds-surface-2 text-ds-text-muted" variant="secondary">
                                {row.childCategories} {t('subcategories')}
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-ds-text-muted">
                          {row.slug}
                        </TableCell>
                        <TableCell className="text-ds-text-muted">
                          {row.parentId
                            ? (categoryNamesById.get(row.parentId) ?? t('emptyValue'))
                            : t('emptyValue')}
                        </TableCell>
                        <TableCell className="text-ds-text-muted">{row.linkedBusinesses}</TableCell>
                        <AdminTableActionsCell>
                          <CategoryRowActions
                            actionsLabel={t('actions')}
                            deleteLabel={t('delete')}
                            editLabel={t('edit')}
                            row={row}
                          />
                        </AdminTableActionsCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AdminDataTableShell>
            </div>
          </>
        )}
      </div>
    </CategoryAdminProvider>
  );
}
