import { desc } from 'drizzle-orm';
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
import { businesses } from '@/db/schema';
import {
  AdminDataTableShell,
  AdminEmptyState,
  AdminFiltersBar,
  AdminMobileCard,
  AdminPageHeader,
  AdminSearchInput,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { BusinessFeatureToggle } from '@/features/admin/components/business-feature-toggle';
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

  const statuses = ['ALL', 'DRAFT', 'PENDING', 'PUBLISHED', 'HIDDEN'] as const;

  return (
    <div className="space-y-5">
      <AdminPageHeader description={t('businessesDescription')} title={t('businessesTitle')} />

      <AdminFiltersBar>
        <form className="flex w-full gap-2 sm:max-w-md" method="GET">
          <AdminSearchInput name="q" placeholder={t('businessName')} value={searchTerm} />
          {statusFilter ? <input name="status" type="hidden" value={statusFilter} /> : null}
          <Button className="h-9 rounded-md" size="sm" type="submit">
            Search
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
                    <TableHead>In top</TableHead>
                    <TableHead>Recommended</TableHead>
                    <TableHead>{t('created')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
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
                      <TableCell className="text-right">
                        <Button asChild className="h-8 rounded-md px-2" size="sm" variant="ghost">
                          <Link href={localizeHref(locale, `/admin/businesses/${business.id}`)}>
                            {t('view')}
                          </Link>
                        </Button>
                      </TableCell>
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
