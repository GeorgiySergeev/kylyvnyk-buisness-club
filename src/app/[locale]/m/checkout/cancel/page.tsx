import type { Metadata } from 'next';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { DashboardPageHeader } from '@/components/member/dashboard-ui';
import { guardOnboarded } from '@/features/auth/lib/role-guards';
import { getT } from '@/lib/i18n/t-server';

/**
 * Stripe post-checkout cancel landing.
 * Not a regular page — noindex to avoid being surfaced in search results.
 */
export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

interface CheckoutCancelPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function CheckoutCancelPage({ params }: CheckoutCancelPageProps) {
  const { locale } = await params;
  await guardOnboarded(locale);
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
          className="inline-flex min-h-11 items-center rounded-md border border-border/50 bg-transparent px-5 text-sm font-semibold text-foreground"
          href={localizeHref(locale, '/m/dashboard?tab=subscription')}
        >
          {t('checkoutReturnDashboard')}
        </Link>
      </section>
    </PageWrapper>
  );
}
