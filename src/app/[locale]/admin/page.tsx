import { count, eq, isNull } from 'drizzle-orm';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/db/client';
import { businesses, clubCards, users } from '@/db/schema';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const t = getT('admin');

  const [userCount] = await db
    .select({ value: count() })
    .from(users)
    .where(isNull(users.deletedAt));

  const [businessCount] = await db
    .select({ value: count() })
    .from(businesses)
    .where(isNull(businesses.deletedAt));

  const [pendingBusinessCount] = await db
    .select({ value: count() })
    .from(businesses)
    .where(eq(businesses.status, 'PENDING'));

  const [activeCardCount] = await db
    .select({ value: count() })
    .from(clubCards)
    .where(eq(clubCards.status, 'ACTIVE'));

  const stats = [
    { label: t('statUsers'), value: userCount!.value },
    { label: t('statBusinesses'), value: businessCount!.value },
    { label: t('statPendingBusinesses'), value: pendingBusinessCount!.value },
    { label: t('statActiveCards'), value: activeCardCount!.value },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('dashboardTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('dashboardDescription')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
