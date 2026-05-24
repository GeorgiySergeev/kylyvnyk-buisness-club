import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';

interface SignUpPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { locale } = await params;
  redirect(localizeHref(locale, '/sign-in'));
}
