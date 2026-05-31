import { Suspense } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { AdminDetailSkeleton } from '@/features/admin/components/admin-detail-skeleton';
import { AdminUserDetailContent } from '@/features/admin/components/admin-user-detail-content';

export const dynamic = 'force-dynamic';

interface AdminUserDetailPageProps {
  params: Promise<{
    locale: SupportedLocale;
    userId: string;
  }>;
}

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { locale, userId } = await params;

  return (
    <Suspense fallback={<AdminDetailSkeleton />}>
      <AdminUserDetailContent locale={locale} userId={userId} />
    </Suspense>
  );
}
