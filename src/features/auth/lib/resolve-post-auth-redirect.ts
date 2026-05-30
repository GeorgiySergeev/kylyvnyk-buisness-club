import 'server-only';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';

import { isOnboardingComplete } from './check-onboarding';
import { isSafeReturnBackUrl } from './return-back-url';

export { isSafeReturnBackUrl } from './return-back-url';

export async function resolvePostAuthRedirect(
  locale: SupportedLocale,
  userId: string,
  returnBackUrl?: string | null,
): Promise<string> {
  const onboardingComplete = await isOnboardingComplete(userId);

  if (!onboardingComplete) {
    return localizeHref(locale, '/m/onboarding');
  }

  if (isSafeReturnBackUrl(returnBackUrl)) {
    return returnBackUrl;
  }

  return localizeHref(locale, '/m/dashboard');
}
