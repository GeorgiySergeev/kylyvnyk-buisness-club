import Link from 'next/link';
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/db/client';
import { BusinessStatusForm } from '@/features/admin/components/business-status-form';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminBusinessDetailPageProps {
  params: Promise<{
    locale: SupportedLocale;
    businessId: string;
  }>;
}

export default async function AdminBusinessDetailPage({ params }: AdminBusinessDetailPageProps) {
  const { locale, businessId } = await params;

  const t = getT('admin');

  const business = await db.query.businesses.findFirst({
    columns: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoUrl: true,
      website: true,
      phone: true,
      email: true,
      status: true,
      isTopPartner: true,
      isRecommended: true,
      createdAt: true,
      updatedAt: true,
    },
    where: (businesses, { eq }) => eq(businesses.id, businessId),
    with: {
      user: {
        columns: {
          id: true,
          displayName: true,
          phone: true,
          email: true,
        },
      },
      country: {
        columns: {
          name: true,
        },
      },
      city: {
        columns: {
          name: true,
        },
      },
      category: {
        columns: {
          name: true,
        },
      },
    },
  });

  if (!business) redirect(localizeHref(locale, '/admin/businesses'));

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="link" size="sm" className="h-auto px-0" asChild>
        <Link href={localizeHref(locale, '/admin/businesses')}>
          &larr; {t('backToBusinesses')}
        </Link>
      </Button>

      <h1 className="text-2xl font-bold text-foreground">{t('businessDetail')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{business.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('slug')}
              </dt>
              <dd className="mt-1 font-mono text-xs text-foreground">{business.slug}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('status')}
              </dt>
              <dd className="mt-1">
                <Badge
                  variant={
                    business.status === 'PUBLISHED'
                      ? 'default'
                      : business.status === 'PENDING'
                        ? 'secondary'
                        : business.status === 'HIDDEN'
                          ? 'destructive'
                          : 'outline'
                  }
                >
                  {business.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('owner')}
              </dt>
              <dd className="mt-1 text-foreground">{business.user?.displayName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('phone')}
              </dt>
              <dd className="mt-1 font-mono text-xs text-foreground">{business.user?.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('email')}
              </dt>
              <dd className="mt-1 text-foreground">{business.user?.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('category')}
              </dt>
              <dd className="mt-1 text-foreground">{business.category?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('country')}
              </dt>
              <dd className="mt-1 text-foreground">{business.country?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('city')}
              </dt>
              <dd className="mt-1 text-foreground">{business.city?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('website')}
              </dt>
              <dd className="mt-1">
                {business.website ? (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    {business.website}
                  </a>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('description')}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-foreground">
                {business.description ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('created')}
              </dt>
              <dd className="mt-1 text-xs text-muted-foreground">
                {business.createdAt.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Updated
              </dt>
              <dd className="mt-1 text-xs text-muted-foreground">
                {business.updatedAt.toLocaleString()}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('changeStatus')}</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessStatusForm businessId={businessId} currentStatus={business.status} />
        </CardContent>
      </Card>
    </div>
  );
}
