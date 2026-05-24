import { eq } from 'drizzle-orm';

import type { SupportedLocale } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ClubCard } from '@/components/member/club-card';
import { db } from '@/db/client';
import { clubCards } from '@/db/schema';
import { guardOnboarded } from '@/features/auth/lib/role-guards';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const user = await guardOnboarded(locale);

  const card = await db.query.clubCards.findFirst({
    where: eq(clubCards.userId, user.id),
  });

  if (!card) {
    return null;
  }

  return (
    <PageWrapper>
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 lg:flex-row lg:items-start">
        <ClubCard
          cardNumber={card.number}
          memberName={user.displayName ?? 'Member'}
          status={card.status}
          verifyUrl={`${env.NEXT_PUBLIC_APP_URL}/${locale}/verify-card/${card.number}`}
        />
      </div>
    </PageWrapper>
  );
}
