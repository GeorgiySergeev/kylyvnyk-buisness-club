// src/app/[locale]/m/card/page.tsx
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';

/**
 * /m/card — canonical redirect to /m/dashboard?tab=profile
 *
 * The Club Card is displayed inside the profile tab of the member dashboard.
 * This page satisfies the routes-map entry for `/m/card` while keeping the
 * single-route, role-gated tab architecture defined in SPEC.md.
 *
 * Access is protected by middleware (PROTECTED_ROUTE_PATTERN covers /m/*).
 */

interface CardPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function MemberCardPage({ params }: CardPageProps) {
  const { locale } = await params;
  redirect(localizeHref(locale, '/m/dashboard?tab=profile'));
}
