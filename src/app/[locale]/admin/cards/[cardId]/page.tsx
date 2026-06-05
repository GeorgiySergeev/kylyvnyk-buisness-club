import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { clubCards } from '@/db/schema';
import { CardDetailTabs } from '@/features/admin/components/card-detail-tabs';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminCardDetailPageProps {
  params: Promise<{
    cardId: string;
    locale: SupportedLocale;
  }>;
}

export default async function AdminCardDetailPage({ params }: AdminCardDetailPageProps) {
  const { cardId, locale } = await params;
  const t = getT('admin', locale);

  const card = await db.query.clubCards.findFirst({
    columns: {
      createdAt: true,
      discountLabel: true,
      expiresAt: true,
      id: true,
      memberType: true,
      number: true,
      status: true,
      updatedAt: true,
    },
    where: eq(clubCards.id, cardId),
    with: {
      user: {
        columns: {
          displayName: true,
          email: true,
          id: true,
          phone: true,
        },
      },
    },
  });

  if (!card) redirect(localizeHref(locale, '/admin/cards'));

  return (
    <CardDetailTabs
      backHref={localizeHref(locale, '/admin/cards')}
      backLabel={t('backToCards')}
      card={{
        createdAt: card.createdAt.toLocaleString(),
        discountLabel: card.discountLabel ?? null,
        expiresAt: card.expiresAt ? card.expiresAt.toLocaleString() : null,
        expiresAtInput: card.expiresAt ? card.expiresAt.toISOString().slice(0, 16) : null,
        id: card.id,
        memberType: card.memberType as 'FREE' | 'BUSINESS' | 'VIP',
        number: card.number,
        status: card.status as 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'ARCHIVED',
        updatedAt: card.updatedAt.toLocaleString(),
      }}
      controlsTitle={t('cardControls')}
      detailTitle={t('cardDetail')}
      labels={{
        cardExpiresAt: t('cardExpiresAt'),
        cardNumber: t('cardNumber'),
        created: t('created'),
        email: t('email'),
        emptyValue: t('emptyValue'),
        memberName: t('memberName'),
        memberType: t('memberType'),
        phone: t('phone'),
        status: t('status'),
        updated: t('updated'),
      }}
      member={{
        displayName: card.user.displayName,
        email: card.user.email,
        phone: card.user.phone,
      }}
      tabLabels={{
        controls: t('controls'),
        details: t('summary'),
      }}
    />
  );
}
