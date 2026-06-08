import { desc, eq, isNull } from 'drizzle-orm';
import { Building2, Download, Filter, Gauge, Plus, Star } from 'lucide-react';
import Link from 'next/link';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
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
import { businessApplications, businesses } from '@/db/schema';
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
import { BusinessApplicationActions } from '@/features/admin/components/business-application-actions';
import { BusinessFeatureToggle } from '@/features/admin/components/business-feature-toggle';
import { BusinessRowActions } from '@/features/admin/components/business-row-actions';
import { BusinessesImportDialog } from '@/features/admin/components/businesses-import-dialog';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminBusinessesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
}

export default async function AdminBusinessesPage({
  params,
  searchParams,
}: AdminBusinessesPageProps) {
  const { locale } = await params;
  const { q, status } = await searchParams;
  const t = getT('admin', locale);

  const searchTerm = q?.trim() ?? '';
  const statusFilter = status?.trim() ?? '';

  type BusinessRow = {
    category: { name: string } | null;
    createdAt: Date;
    id: string;
    isRecommended: boolean;
    isTopPartner: boolean;
    name: string;
    slug: string;
    status: string;
    user: { displayName: string | null; id: string } | null;
  };

  const allBusinesses: BusinessRow[] = await db.query.businesses.findMany({
    columns: {
      createdAt: true,
      id: true,
      isRecommended: true,
      isTopPartner: true,
      name: true,
      slug: true,
      status: true,
    },
    orderBy: [desc(businesses.createdAt)],
    with: {
      category: {
        columns: {
          name: true,
        },
      },
      user: {
        columns: {
          displayName: true,
          id: true,
        },
      },
    },
  });

  const pendingApplications = await db.query.businessApplications.findMany({
    orderBy: [desc(businessApplications.createdAt)],
    where: (table, { and }) =>
      and(eq(table.status, 'UNDER_REVIEW'), isNull(table.deletedAt)),
    with: {
      category: {
        columns: { name: true },
      },
      country: {
        columns: { name: true },
      },
    },
  });

  let filtered = allBusinesses;

  if (statusFilter) {
    filtered = filtered.filter((business) => business.status === statusFilter);
  }

  if (searchTerm) {
    filtered = filtered.filter(
      (business) =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.slug.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  const statuses = ['ALL', 'UNDER_REVIEW', 'PUBLISHED', 'HIDDEN'] as const;
  const pendingCount =
    allBusinesses.filter((business) => business.status === 'UNDER_REVIEW').length +
    pendingApplications.length;
  const publishedCount = allBusinesses.filter((business) => business.status === 'PUBLISHED').length;
  const featuredCount = allBusinesses.filter(
    (business) => business.isRecommended || business.isTopPartner,
  ).length;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description={t('businessesDescription')}
        title={t('businessesTitle')}
        actions={
          <>
            <BusinessesImportDialog
              labels={{
                cancel: t('cancel'),
                close: t('close'),
                emptyValue: t('emptyValue'),
                importBusinesses: t('importBusinesses'),
                importBusinessesTitle: t('importBusinessesTitle'),
                importBusinessesDescription: t('importBusinessesDescription'),
                importDropzone: t('importDropzone'),
                importPreview: t('importPreview'),
                importSelectedRows: t('importSelectedRows'),
                importConfirm: t('importConfirmBusiness'),
                importing: t('importing'),
                importSuccess: t('importBusinessSuccess'),
                importPartialSuccess: t('importPartialSuccess'),
                importErrors: t('importErrors'),
                importErrorColumn: t('importErrorColumn'),
                importMoreRows: t('importMoreRows'),
                importRowNumber: t('importRowNumber'),
                importRowError: t('importRowError'),
                importInvalidFile: t('importInvalidFile'),
                importTooManyRows: t('importTooManyRows'),
                importEmpty: t('importEmpty'),
                name: t('name'),
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 border-0 bg-card text-foreground"
              asChild
            >
              <a download href="/api/admin/businesses/export">
                <Download aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">{t('export')}</span>
              </a>
            </Button>
            <Button
              size="sm"
              className="h-9 gap-2"
              asChild
            >
              <Link href={localizeHref(locale, '/admin/businesses/new')}>
                <Plus aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">{t('addBusiness')}</span>
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminMetricCard
          icon={<Building2 className="size-4" />}
          label={t('businessesMetricPublished')}
          tone="success"
          value={publishedCount}
        />
        <AdminMetricCard
          icon={<Gauge className="size-4" />}
          label={t('businessesMetricPending')}
          tone="warning"
          value={pendingCount}
        />
        <AdminMetricCard
          icon={<Star className="size-4" />}
          label={t('businessesMetricFeatured')}
          value={featuredCount}
        />
      </div>

      <div className="flex items-center gap-2 text-ds-text-sm font-medium text-ds-text">
        <Filter aria-hidden="true" className="size-4 text-ds-text-muted" />
        {t('businessApplicationsTitle')}
        <span className="text-ds-text-muted">({pendingApplications.length.toLocaleString()})</span>
      </div>

      <AdminDataTableShell>
        {pendingApplications.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState title={t('businessApplicationsEmpty')} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t('businessName')}</TableHead>
                <TableHead>{t('businessApplicationApplicant')}</TableHead>
                <TableHead>{t('businessApplicationContact')}</TableHead>
                <TableHead>{t('location')}</TableHead>
                <TableHead>{t('created')}</TableHead>
                <AdminTableActionsHead label={t('actions')} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{application.businessName}</div>
                    <div className="text-xs text-muted-foreground">
                      {application.category?.name ?? t('emptyValue')}
                    </div>
                  </TableCell>
                  <TableCell>{application.representativeName}</TableCell>
                  <TableCell>
                    <div>{application.email}</div>
                    <div className="text-xs text-muted-foreground">{application.phone}</div>
                    <div className="break-all text-xs text-muted-foreground">
                      {application.websiteOrSocial}
                    </div>
                  </TableCell>
                  <TableCell>
                    {[application.cityName, application.country?.name].filter(Boolean).join(', ')}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {application.createdAt.toLocaleDateString()}
                  </TableCell>
                  <AdminTableActionsCell>
                    <BusinessApplicationActions
                      applicationId={application.id}
                      approveLabel={t('businessApplicationApprove')}
                      hideLabel={t('businessApplicationHide')}
                    />
                  </AdminTableActionsCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </AdminDataTableShell>

      <div className="flex items-center gap-2 text-ds-text-sm font-medium text-ds-text">
        <Filter aria-hidden="true" className="size-4 text-ds-text-muted" />
        {t('businessesDirectory')}
        <span className="text-ds-text-muted">({filtered.length.toLocaleString()})</span>
      </div>

      <AdminFiltersBar>
        <form className="flex w-full gap-2 sm:max-w-md" method="GET">
          <AdminSearchInput name="q" placeholder={t('businessName')} value={searchTerm} />
          {statusFilter ? <input name="status" type="hidden" value={statusFilter} /> : null}
          <Button className="h-9 rounded-md" size="sm" type="submit">
            {t('search')}
          </Button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {statuses.map((item) => {
            const isActive = item === 'ALL' ? !statusFilter : statusFilter === item;
            const href =
              item === 'ALL'
                ? localizeHref(locale, '/admin/businesses')
                : `${localizeHref(locale, '/admin/businesses')}?status=${item}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''}`;

            return (
              <Button
                asChild
                className="h-8 rounded-md"
                key={item}
                size="sm"
                variant={isActive ? 'default' : 'outline'}
              >
                <Link href={href}>{item}</Link>
              </Button>
            );
          })}
        </div>
      </AdminFiltersBar>

      {filtered.length === 0 ? (
        <AdminEmptyState title={t('noBusinesses')} />
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {filtered.map((business) => (
              <AdminMobileCard
                key={business.id}
                title={business.name}
                subtitle={business.slug}
                badge={<AdminStatusBadge>{business.status}</AdminStatusBadge>}
                href={localizeHref(locale, `/admin/businesses/${business.id}`)}
                rows={[
                  { label: t('owner'), value: business.user?.displayName ?? 'N/A' },
                  { label: t('category'), value: business.category?.name ?? 'N/A' },
                  {
                    label: t('created'),
                    value: business.createdAt.toLocaleDateString(),
                  },
                ]}
                actions={
                  <>
                    <BusinessFeatureToggle
                      businessId={business.id}
                      feature="isRecommended"
                      pressed={business.isRecommended}
                    />
                    <BusinessFeatureToggle
                      businessId={business.id}
                      feature="isTopPartner"
                      pressed={business.isTopPartner}
                    />
                  </>
                }
              />
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block">
            <AdminDataTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{t('businessName')}</TableHead>
                    <TableHead>{t('owner')}</TableHead>
                    <TableHead>{t('category')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('businessesInTop')}</TableHead>
                    <TableHead>{t('businessesRecommended')}</TableHead>
                    <TableHead>{t('created')}</TableHead>
                    <AdminTableActionsHead label={t('actions')} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{business.name}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {business.slug}
                        </div>
                      </TableCell>
                      <TableCell>{business.user?.displayName ?? 'N/A'}</TableCell>
                      <TableCell>{business.category?.name ?? 'N/A'}</TableCell>
                      <TableCell>
                        <AdminStatusBadge>{business.status}</AdminStatusBadge>
                      </TableCell>
                      <TableCell>
                        <BusinessFeatureToggle
                          businessId={business.id}
                          feature="isTopPartner"
                          pressed={business.isTopPartner}
                        />
                      </TableCell>
                      <TableCell>
                        <BusinessFeatureToggle
                          businessId={business.id}
                          feature="isRecommended"
                          pressed={business.isRecommended}
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {business.createdAt.toLocaleDateString()}
                      </TableCell>
                      <AdminTableActionsCell>
                        <BusinessRowActions
                          actionLabel={t('actions')}
                          viewHref={localizeHref(locale, `/admin/businesses/${business.id}`)}
                          viewLabel={t('view')}
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
  );
}
