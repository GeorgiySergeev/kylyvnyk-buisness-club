import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { DashboardPageHeader } from '@/components/member/dashboard-ui';
import { getT } from '@/lib/i18n/t-server';

interface CheckoutCancelPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function CheckoutCancelPage({ params }: CheckoutCancelPageProps) {
  const { locale } = await params;
  const t = getT('dashboard', locale);

  return (
    <PageWrapper noTopPad className="max-w-3xl">
      <DashboardPageHeader
        description={t('checkoutCancelDescription')}
        eyebrow={t('subscriptionTitle')}
        title={t('checkoutCancelTitle')}
      />
      <section className="border-y border-border/50 px-6 py-10 sm:px-8">
        <Link
          className="inline-flex min-h-11 items-center rounded-md border border-border/50 bg-transparent px-5 text-sm font-semibold text-white"
          href={localizeHref(locale, '/m/dashboard?tab=features')}
        >
          {t('checkoutReturnDashboard')}
        </Link>
      </section>
    </PageWrapper>
  );
}
