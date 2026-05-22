import 'server-only';

import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';

import { isOnboardingComplete } from './check-onboarding';
import { requireRole, requireUser } from './current-user';

export async function guardOnboarded(locale: SupportedLocale) {
  const user = await requireUser(locale);
  const complete = await isOnboardingComplete(user.id);

  if (!complete) {
    redirect(localizeHref(locale, '/m/onboarding'));
  }

  return user;
}

export async function guardBusiness(locale: SupportedLocale) {
  return requireRole(locale, ['BUSINESS', 'ADMIN']);
}

export async function guardAdmin(locale: SupportedLocale) {
  return requireRole(locale, 'ADMIN');
}
