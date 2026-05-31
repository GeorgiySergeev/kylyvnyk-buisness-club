// src/app/[locale]/m/subscription/page.tsx
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';

/**
 * /m/subscription — canonical redirect to /m/dashboard?tab=features
 *
 * Subscription management (VIP upgrade / cancel, billing portal) lives inside
 * the "features" tab of the member dashboard (MembershipPossibilitiesPanel).
 * This page satisfies the routes-map entry for `/m/subscription` while keeping
 * the single-route, role-gated tab architecture defined in SPEC.md.
 *
 * Access is protected by middleware (PROTECTED_ROUTE_PATTERN covers /m/*).
 */

interface SubscriptionPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function MemberSubscriptionPage({ params }: SubscriptionPageProps) {
  const { locale } = await params;
  redirect(localizeHref(locale, '/m/dashboard?tab=features'));
}
