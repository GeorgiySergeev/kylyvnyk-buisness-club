// src/app/[locale]/m/my-business/page.tsx
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';

/**
 * /m/my-business — canonical redirect to /m/dashboard?tab=features
 *
 * Business management (submit business, view status) is presented inside
 * the "features" tab of the member dashboard (MembershipPossibilitiesPanel).
 * This page satisfies the routes-map entry for `/m/my-business` while keeping
 * the single-route, role-gated tab architecture defined in SPEC.md.
 *
 * Access is protected by middleware (PROTECTED_ROUTE_PATTERN covers /m/*).
 */

interface MyBusinessPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function MemberMyBusinessPage({ params }: MyBusinessPageProps) {
  const { locale } = await params;
  redirect(localizeHref(locale, '/m/dashboard?tab=features'));
}
