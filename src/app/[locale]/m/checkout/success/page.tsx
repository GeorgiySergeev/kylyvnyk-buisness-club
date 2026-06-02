import type { Metadata } from 'next';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { DashboardPageHeader } from '@/components/member/dashboard-ui';
import { guardOnboarded } from '@/features/auth/lib/role-guards';
import { reconcileCheckoutSessionMembership } from '@/features/billing/lib/membership-lifecycle';
import { getT } from '@/lib/i18n/t-server';

/**
 * Stripe post-checkout success landing.
 * Not a regular page — noindex to avoid being surfaced in search results.
 */
export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

export const dynamic = 'force-dynamic';

interface CheckoutSuccessPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
  searchParams: Promise<{
    session_id?: string;
  }>;
}

export default async function CheckoutSuccessPage({ params, searchParams }: CheckoutSuccessPageProps) {
  const { locale } = await params;
  const { session_id: sessionId } = await searchParams;
  const user = await guardOnboarded(locale);
  const t = getT('dashboard', locale);

  if (sessionId) {
    await reconcileCheckoutSessionMembership(sessionId, user.id);
    revalidatePath(localizeHref(locale, '/m/dashboard'));
    revalidatePath(localizeHref(locale, '/admin/users'));
    revalidatePath(localizeHref(locale, `/admin/users/${user.id}`));
  }

  return (
    <PageWrapper noTopPad className="max-w-3xl">
      <DashboardPageHeader
        description={t('checkoutSuccessDescription')}
        eyebrow={t('subscriptionTitle')}
        title={t('checkoutSuccessTitle')}
      />
      <section className="border-y border-border/50 px-6 py-10 sm:px-8">
        <Link
          className="inline-flex min-h-11 items-center rounded-md border border-primary/40 bg-primary px-5 text-sm font-semibold text-primary-foreground"
          href={localizeHref(locale, '/m/dashboard?tab=subscription')}
        >
          {t('checkoutReturnDashboard')}
        </Link>
      </section>
    </PageWrapper>
  );
}
