import Link from 'next/link';
import { redirect } from 'next/navigation';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { db } from '@/db/client';
import {
  AdminDescriptionList,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
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
      expiresAt: true,
      id: true,
      memberType: true,
      number: true,
      status: true,
      updatedAt: true,
    },
    where: (cards, { eq }) => eq(cards.id, cardId),
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
    <div className="max-w-4xl space-y-5">
      <Button asChild className="h-8 rounded-md px-0" size="sm" variant="link">
        <Link href={localizeHref(locale, '/admin/cards')}>Back to cards</Link>
      </Button>

      <AdminPageHeader
        actions={<AdminStatusBadge>{card.status}</AdminStatusBadge>}
        description={card.user.displayName ?? card.user.phone}
        title={card.number}
      />

      <AdminPanel title={t('cardsTitle')}>
        <AdminDescriptionList
          items={[
            { label: t('cardNumber'), value: <span className="font-mono text-xs">{card.number}</span> },
            { label: t('memberType'), value: <AdminStatusBadge>{card.memberType}</AdminStatusBadge> },
            { label: t('status'), value: <AdminStatusBadge>{card.status}</AdminStatusBadge> },
            { label: t('memberName'), value: card.user.displayName ?? 'N/A' },
            { label: t('phone'), value: card.user.phone },
            { label: t('email'), value: card.user.email ?? 'N/A' },
            {
              label: t('cardExpiresAt'),
              value: card.expiresAt ? card.expiresAt.toLocaleString() : 'N/A',
            },
            { label: t('created'), value: card.createdAt.toLocaleString() },
            { label: 'Updated', value: card.updatedAt.toLocaleString() },
          ]}
        />
      </AdminPanel>
    </div>
  );
}
