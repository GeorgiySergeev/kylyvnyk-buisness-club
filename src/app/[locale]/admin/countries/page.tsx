import { asc, isNull } from 'drizzle-orm';
import { Building2, Flag, Globe2 } from 'lucide-react';

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
import { businesses, countries } from '@/db/schema';
import {
  AdminDataTableShell,
  AdminEmptyState,
  AdminMetricCard,
  AdminPageHeader,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { CountriesCrud } from '@/features/admin/components/countries-crud';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminCountriesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminCountriesPage({ params }: AdminCountriesPageProps) {
  const { locale } = await params;
  const t = getT('admin', locale);

  type CountryRow = {
    flagEmoji: string | null;
    id: number;
    iso2: string;
    name: string;
  };
  type BusinessCountryRef = {
    countryId: number | null;
  };

  const [countryRows, businessRows]: [CountryRow[], BusinessCountryRef[]] = await Promise.all([
    db.query.countries.findMany({
      columns: {
        flagEmoji: true,
        id: true,
        iso2: true,
        name: true,
      },
      orderBy: [asc(countries.name)],
    }),
    db.query.businesses.findMany({
      columns: {
        countryId: true,
      },
      where: isNull(businesses.deletedAt),
    }),
  ]);

  const businessCountsByCountry = businessRows.reduce<Map<number, number>>((counts, business) => {
    if (business.countryId === null) return counts;
    counts.set(business.countryId, (counts.get(business.countryId) ?? 0) + 1);
    return counts;
  }, new Map());
  const linkedCountryCount = Array.from(businessCountsByCountry.values()).filter((count) => count > 0).length;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description={t('countriesDescription')}
        eyebrow={t('navCatalog')}
        title={t('countriesTitle')}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminMetricCard
          icon={<Globe2 className="size-4" />}
          label={t('countriesMetricTotal')}
          meta={t('liveDatabaseSnapshot')}
          value={countryRows.length}
        />
        <AdminMetricCard
          icon={<Building2 className="size-4" />}
          label={t('countriesMetricLinked')}
          meta={t('liveDatabaseSnapshot')}
          tone={linkedCountryCount > 0 ? 'success' : undefined}
          value={linkedCountryCount}
        />
        <AdminMetricCard
          icon={<Flag className="size-4" />}
          label={t('countriesMetricFlags')}
          meta={t('liveDatabaseSnapshot')}
          value={countryRows.filter((country) => country.flagEmoji).length}
        />
      </div>

      <CountriesCrud
        labels={{
          create: t('create'),
          delete: t('delete'),
          flag: t('countryFlag'),
          iso2: t('countryIso'),
          name: t('countryName'),
          save: t('saveShort'),
        }}
        rows={countryRows.map((country) => ({
          ...country,
          linkedBusinesses: businessCountsByCountry.get(country.id) ?? 0,
        }))}
      />

      {countryRows.length === 0 ? (
        <AdminEmptyState description={t('noCountriesDescription')} title={t('noCountries')} />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-1 rounded-ds-radius-md border border-ds-border bg-ds-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-ds-text-sm font-semibold text-ds-text">{t('countriesDirectory')}</p>
              <p className="text-ds-text-xs text-ds-text-muted">{t('countriesDescription')}</p>
            </div>
            <AdminStatusBadge tone="info">
              {countryRows.length} {t('countriesTitle')}
            </AdminStatusBadge>
          </div>

          <AdminDataTableShell>
            <Table>
              <TableHeader>
                <TableRow className="border-0 bg-ds-surface-2/70 hover:bg-ds-surface-2/70">
                  <TableHead className="text-ds-text-muted">{t('countryName')}</TableHead>
                  <TableHead className="text-ds-text-muted">{t('countryIso')}</TableHead>
                  <TableHead className="text-ds-text-muted">{t('countryFlag')}</TableHead>
                  <TableHead className="text-right text-ds-text-muted">{t('linkedBusinesses')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countryRows.map((country) => (
                  <TableRow className="border-ds-border" key={country.id}>
                    <TableCell className="font-medium text-ds-text">{country.name}</TableCell>
                    <TableCell className="font-mono text-[11px] text-ds-text-muted">
                      {country.iso2}
                    </TableCell>
                    <TableCell>{country.flagEmoji ?? t('emptyValue')}</TableCell>
                    <TableCell className="text-right text-ds-text-muted">
                      {businessCountsByCountry.get(country.id) ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminDataTableShell>
        </div>
      )}
    </div>
  );
}
