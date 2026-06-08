import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';

interface BusinessNewPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function BusinessNewPage({ params }: BusinessNewPageProps) {
  const { locale } = await params;

  redirect(localizeHref(locale, '/partner/register'));
}
