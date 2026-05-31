// src/app/[locale]/m/profile/page.tsx
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';

/**
 * /m/profile — canonical redirect to /m/dashboard?tab=profile
 *
 * Profile data is displayed inside the profile tab of the member dashboard.
 * This page satisfies the routes-map entry for `/m/profile` while keeping
 * the single-route, role-gated tab architecture defined in SPEC.md.
 *
 * Access is protected by middleware (PROTECTED_ROUTE_PATTERN covers /m/*).
 */

interface ProfilePageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function MemberProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  redirect(localizeHref(locale, '/m/dashboard?tab=profile'));
}
