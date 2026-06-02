import 'server-only';

import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';

import { decideAdminRouteAccess, decideMemberRouteAccess } from './admin-access';
import { requireRole, requireUser } from './current-user';
import { hasVerifiedMfaInSession } from './mfa';

export async function guardOnboarded(locale: SupportedLocale) {
  const user = await requireUser(locale);

  // `requireUser` already loads the related profile (`with: { profile: true }`),
  // so we read onboarding state from it instead of issuing a second query.
  if (user.profile?.countryId == null && user.profile?.onboardingSkippedAt == null) {
    redirect(localizeHref(locale, '/m/onboarding'));
  }

  const isAdminRole = user.role === 'ADMIN' || user.role === 'OWNER';
  const memberRouteDecision = decideMemberRouteAccess({
    hasMfa: isAdminRole ? await hasVerifiedMfaInSession() : false,
    role: user.role,
  });

  if (memberRouteDecision === 'REDIRECT_ADMIN') {
    redirect(localizeHref(locale, '/admin'));
  }

  if (memberRouteDecision === 'REDIRECT_MFA') {
    redirect(localizeHref(locale, '/m/2fa-required'));
  }

  return user;
}

export async function guardBusiness(locale: SupportedLocale) {
  return requireRole(locale, ['MEMBER', 'MANAGER', 'ADMIN', 'OWNER']);
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
