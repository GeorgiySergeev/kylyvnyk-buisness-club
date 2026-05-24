import 'server-only';

import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';

import { decideAdminRouteAccess } from './admin-access';
import { isOnboardingComplete } from './check-onboarding';
import { requireRole, requireUser } from './current-user';
import { hasVerifiedMfaInSession } from './mfa';

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
  const user = await requireUser(locale);
  const hasMfa = await hasVerifiedMfaInSession();
  const decision = decideAdminRouteAccess({
    hasMfa,
    isAuthenticated: true,
    role: user.role,
  });

  if (decision === 'REDIRECT_HOME') {
    redirect(localizeHref(locale, '/'));
  }

  if (decision === 'REDIRECT_MFA') {
    redirect(localizeHref(locale, '/m/2fa-required'));
  }

  return user;
}
