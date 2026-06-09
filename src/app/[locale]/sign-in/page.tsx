import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthAlternateLink } from '@/features/auth/components/auth-alternate-link';
import { AuthPageHeader } from '@/features/auth/components/auth-page-header';
import { PhoneAuthForm } from '@/features/auth/components/phone-auth-form';
import { isAuthDevPhoneBypassEnabled } from '@/features/auth/lib/auth-identity';
import { resolveAuthenticatedAuthPageRedirectPath } from '@/features/auth/lib/auth-page-redirect';
import { isOnboardingComplete } from '@/features/auth/lib/check-onboarding';
import { getCurrentUser } from '@/features/auth/lib/current-user';
import { hasVerifiedMfaInSession } from '@/features/auth/lib/mfa';
import { getT } from '@/lib/i18n/t-server';

interface SignInPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
  searchParams: Promise<{
    returnBackUrl?: string;
  }>;
}

export default async function SignInPage({ params, searchParams }: SignInPageProps) {
  const { locale } = await params;
  const { returnBackUrl } = await searchParams;
  const user = await getCurrentUser();

  if (user) {
    const isAdminRole = user.role === 'ADMIN' || user.role === 'OWNER';
    const redirectPath = resolveAuthenticatedAuthPageRedirectPath({
      hasMfa: isAdminRole ? await hasVerifiedMfaInSession() : false,
      onboardingComplete: await isOnboardingComplete(user.id),
      role: user.role,
    });

    redirect(localizeHref(locale, redirectPath));
  }

  const tAuth = getT('auth', locale);

  return (
    <PageWrapper noTopPad className="max-w-5xl">
      <AuthPageHeader
        eyebrow={tAuth('authCardEyebrow')}
        title={tAuth('signInTitle')}
        description={tAuth('authCardIntro')}
        titleId="sign-in-title"
      />

      <section className="relative overflow-hidden border-y border-border/50">
        <div className="kc-how-it-works-bg pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative flex flex-col items-center gap-8 px-6 py-10 sm:px-8 sm:py-12 md:py-16">
          <PhoneAuthForm
            devBypassEnabled={isAuthDevPhoneBypassEnabled()}
            intent="sign-in"
            returnBackUrl={returnBackUrl}
            labels={{
              accountExists: tAuth('phoneAuthGoToSignIn'),
              code: tAuth('phoneAuthCodeLabel'),
              codeHelp: tAuth('phoneAuthCodeHelp'),
              devBypass: tAuth('phoneAuthDevBypass'),
              phone: tAuth('phoneAuthPhoneLabel'),
              phoneHelp: tAuth('phoneAuthPhoneHelp'),
              phoneInvalid: tAuth('phoneAuthPhoneInvalid'),
              phonePlaceholder: tAuth('phoneAuthPhonePlaceholder'),
              requestCode: tAuth('phoneAuthRequestCode'),
              submitting: tAuth('phoneAuthSubmitting'),
              verifyCode: tAuth('phoneAuthVerifyCode'),
            }}
            locale={locale}
          />
          <AuthAlternateLink
            href={localizeHref(locale, '/sign-up')}
            linkLabel={tAuth('joinNow')}
            prompt={tAuth('authNewMemberPrompt')}
          />
        </div>
      </section>
    </PageWrapper>
  );
}
