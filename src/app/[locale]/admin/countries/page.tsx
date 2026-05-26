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

interface AdminCountriesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminCountriesPage({ params }: AdminCountriesPageProps) {
  const { locale } = await params;
  const t = getT('admin', locale);

  const [countryRows, businessRows] = await Promise.all([
    db.query.countries.findMany({
      columns: {
        flagEmoji: true,
        id: true,
        iso2: true,
        name: true,
      },
      orderBy: (countries, { asc }) => [asc(countries.name)],
    }),
    db.query.businesses.findMany({
      columns: {
        countryId: true,
      },
      where: (businesses, { isNull }) => isNull(businesses.deletedAt),
    }),
  ]);

  const businessCountsByCountry = businessRows.reduce<Map<number, number>>((counts, business) => {
    if (business.countryId === null) return counts;
    counts.set(business.countryId, (counts.get(business.countryId) ?? 0) + 1);
    return counts;
  }, new Map());

  return (
    <div className="space-y-5">
      <AdminPageHeader description={t('countriesDescription')} title={t('countriesTitle')} />

      {countryRows.length === 0 ? (
        <AdminEmptyState description={t('noCountriesDescription')} title={t('noCountries')} />
      ) : (
        <AdminDataTableShell>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t('countryName')}</TableHead>
                <TableHead>{t('countryIso')}</TableHead>
                <TableHead>{t('countryFlag')}</TableHead>
                <TableHead className="text-right">{t('linkedBusinesses')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countryRows.map((country) => (
                <TableRow key={country.id}>
                  <TableCell className="font-medium text-foreground">{country.name}</TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {country.iso2}
                  </TableCell>
                  <TableCell>{country.flagEmoji ?? t('emptyValue')}</TableCell>
                  <TableCell className="text-right">
                    {businessCountsByCountry.get(country.id) ?? 0}
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
