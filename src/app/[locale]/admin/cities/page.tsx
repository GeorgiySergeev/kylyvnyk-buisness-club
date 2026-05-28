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
import { businesses, cities } from '@/db/schema';
import {
  AdminDataTableShell,
  AdminEmptyState,
  AdminPageHeader,
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

  return (
    <div className="space-y-5">
      <AdminPageHeader description={t('countriesDescription')} title="Cities" />

      <CitiesCrud
        rows={rows.map((city) => ({
          countryId: city.countryId,
          countryIso2: city.country?.iso2 ?? 'N/A',
          countryName: city.country?.name ?? 'N/A',
          id: city.id,
          linkedBusinesses: linkedBusinesses.get(city.id) ?? 0,
          name: city.name,
        }))}
      />

      {rows.length === 0 ? (
        <AdminEmptyState title={t('emptyValue')} />
      ) : (
        <AdminDataTableShell>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>City</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>ISO2</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((city) => (
                <TableRow key={city.id}>
                  <TableCell className="font-medium text-foreground">{city.name}</TableCell>
                  <TableCell>{city.country?.name ?? 'N/A'}</TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {city.country?.iso2 ?? 'N/A'}
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
