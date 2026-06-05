import { asc, isNull } from 'drizzle-orm';
import { Building2, MapPin, Navigation } from 'lucide-react';

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
import { businesses, cities } from '@/db/schema';
import {
  AdminDataTableShell,
  AdminEmptyState,
  AdminMetricCard,
  AdminPageHeader,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { CitiesCrud } from '@/features/admin/components/cities-crud';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminCitiesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminCitiesPage({ params }: AdminCitiesPageProps) {
  const { locale } = await params;
  const t = getT('admin', locale);

  type CityRow = {
    country: { iso2: string; name: string } | null;
    countryId: number;
    id: number;
    name: string;
  };
  type BusinessCityRef = {
    cityId: number | null;
  };

  const [rows, businessRows]: [CityRow[], BusinessCityRef[]] = await Promise.all([
    db.query.cities.findMany({
      columns: { countryId: true, id: true, name: true },
      orderBy: [asc(cities.name)],
      with: {
        country: { columns: { iso2: true, name: true } },
      },
    }),
    db.query.businesses.findMany({
      columns: { cityId: true },
      where: isNull(businesses.deletedAt),
    }),
  ]);

  const linkedBusinesses = businessRows.reduce<Map<number, number>>((acc, row) => {
    if (!row.cityId) return acc;
    acc.set(row.cityId, (acc.get(row.cityId) ?? 0) + 1);
    return acc;
  }, new Map());
  const linkedCityCount = Array.from(linkedBusinesses.values()).filter((count) => count > 0).length;
  const representedCountriesCount = new Set(rows.map((city) => city.countryId)).size;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description={t('citiesDescription')}
        eyebrow={t('navCatalog')}
        title={t('citiesTitle')}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminMetricCard
          icon={<MapPin className="size-4" />}
          label={t('citiesMetricTotal')}
          meta={t('liveDatabaseSnapshot')}
          value={rows.length}
        />
        <AdminMetricCard
          icon={<Building2 className="size-4" />}
          label={t('citiesMetricLinked')}
          meta={t('liveDatabaseSnapshot')}
          tone={linkedCityCount > 0 ? 'success' : undefined}
          value={linkedCityCount}
        />
        <AdminMetricCard
          icon={<Navigation className="size-4" />}
          label={t('citiesMetricCountries')}
          meta={t('liveDatabaseSnapshot')}
          value={representedCountriesCount}
        />
      </div>

      <CitiesCrud
        labels={{
          countryId: t('countryId'),
          create: t('create'),
          delete: t('delete'),
          name: t('cityName'),
          save: t('saveShort'),
        }}
        rows={rows.map((city) => ({
          countryId: city.countryId,
          countryIso2: city.country?.iso2 ?? t('emptyValue'),
          countryName: city.country?.name ?? t('emptyValue'),
          id: city.id,
          linkedBusinesses: linkedBusinesses.get(city.id) ?? 0,
          name: city.name,
        }))}
      />

      {rows.length === 0 ? (
        <AdminEmptyState title={t('noCities')} />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-1 rounded-ds-radius-md border border-ds-border bg-ds-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-ds-text-sm font-semibold text-ds-text">{t('citiesDirectory')}</p>
              <p className="text-ds-text-xs text-ds-text-muted">{t('citiesDescription')}</p>
            </div>
            <AdminStatusBadge tone="info">
              {rows.length} {t('citiesTitle')}
            </AdminStatusBadge>
          </div>

          <AdminDataTableShell>
            <Table>
              <TableHeader>
                <TableRow className="border-0 bg-ds-surface-2/70 hover:bg-ds-surface-2/70">
                  <TableHead className="text-ds-text-muted">{t('cityName')}</TableHead>
                  <TableHead className="text-ds-text-muted">{t('countryName')}</TableHead>
                  <TableHead className="text-ds-text-muted">{t('countryIso')}</TableHead>
                  <TableHead className="text-right text-ds-text-muted">{t('linkedBusinesses')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((city) => (
                  <TableRow className="border-ds-border" key={city.id}>
                    <TableCell className="font-medium text-ds-text">{city.name}</TableCell>
                    <TableCell className="text-ds-text-muted">{city.country?.name ?? t('emptyValue')}</TableCell>
                    <TableCell className="font-mono text-[11px] text-ds-text-muted">
                      {city.country?.iso2 ?? t('emptyValue')}
                    </TableCell>
                    <TableCell className="text-right text-ds-text-muted">
                      {linkedBusinesses.get(city.id) ?? 0}
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
