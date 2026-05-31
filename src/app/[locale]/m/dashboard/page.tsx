import { Suspense } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { MemberDashboardPageContent } from '@/features/member/components/member-dashboard-page-content';
import { MemberDashboardSkeleton } from '@/features/member/components/member-dashboard-skeleton';

export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const { locale } = await params;
  const { tab } = await searchParams;

  return (
    <PageWrapper noTopPad className="max-w-5xl">
      <div className="px-4 pb-8 pt-6 sm:px-0 sm:pt-8">
        <Suspense fallback={<MemberDashboardSkeleton />}>
          <MemberDashboardPageContent locale={locale} tab={tab} />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
