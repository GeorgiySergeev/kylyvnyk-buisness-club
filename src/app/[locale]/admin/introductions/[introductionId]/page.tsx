import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { introductions } from '@/db/schema';
import { IntroductionDetailTabs } from '@/features/admin/components/introduction-detail-tabs';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminIntroductionDetailPageProps {
  params: Promise<{
    introductionId: string;
    locale: SupportedLocale;
  }>;
}

export default async function AdminIntroductionDetailPage({
  params,
}: AdminIntroductionDetailPageProps) {
  const { introductionId, locale } = await params;
  const t = getT('admin', locale);

  const row = await db.query.introductions.findFirst({
    columns: {
      adminNote: true,
      clientContact: true,
      clientName: true,
      createdAt: true,
      id: true,
      message: true,
      status: true,
      updatedAt: true,
    },
    where: eq(introductions.id, introductionId),
    with: {
      requester: {
        columns: {
          displayName: true,
          id: true,
          phone: true,
        },
      },
      targetBusiness: {
        columns: {
          deletedAt: true,
          id: true,
          name: true,
          status: true,
        },
        with: {
          city: { columns: { name: true } },
          country: { columns: { name: true } },
        },
      },
    },
  });

  if (!row) redirect(localizeHref(locale, '/admin/introductions'));

  const targetBusiness = row.targetBusiness;
  const location =
    [targetBusiness?.city?.name, targetBusiness?.country?.name].filter(Boolean).join(' · ') ||
    null;

  return (
    <IntroductionDetailTabs
      backHref={localizeHref(locale, '/admin/introductions')}
      backLabel={t('backToIntroductions')}
      introduction={{
        adminNote: row.adminNote,
        clientContact: row.clientContact,
        clientName: row.clientName,
        createdAt: row.createdAt.toLocaleString(),
        id: row.id,
        message: row.message,
        status: row.status,
        updatedAt: row.updatedAt.toLocaleString(),
      }}
      labels={{
        adminNote: t('adminNote'),
        business: t('business'),
        client: t('client'),
        clientContact: t('clientContact'),
        created: t('created'),
        location: t('location'),
        message: t('message'),
        requester: t('requester'),
        status: t('status'),
        updated: t('updated'),
      }}
      moderationLabels={{
        adminNotePlaceholder: t('adminNotePlaceholder'),
        approve: t('approve'),
        reject: t('reject'),
        save: t('save'),
        statusUpdated: t('introductionStatusUpdated'),
        underReview: t('underReview'),
        updateError: t('introductionUpdateError'),
      }}
      requester={
        row.requester
          ? {
              displayName: row.requester.displayName,
              href: localizeHref(locale, `/admin/users/${row.requester.id}`),
              phone: row.requester.phone,
            }
          : null
      }
      tabLabels={{
        moderation: t('moderation'),
        overview: t('summary'),
      }}
      targetBusiness={
        targetBusiness
          ? {
              href: localizeHref(locale, `/admin/businesses/${targetBusiness.id}`),
              location,
              name: targetBusiness.name,
            }
          : null
      }
    />
  );
}
