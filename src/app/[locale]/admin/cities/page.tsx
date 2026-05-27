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
import {
  AdminDataTableShell,
  AdminEmptyState,
  AdminPageHeader,
} from '@/features/admin/components/admin-ui';
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

  const rows = await db.query.cities.findMany({
    columns: { id: true, name: true },
    orderBy: (cities, { asc }) => [asc(cities.name)],
    with: {
      country: { columns: { iso2: true, name: true } },
    },
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader description={t('countriesDescription')} title="Cities" />
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
