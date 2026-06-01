import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthAlternateLink } from '@/features/auth/components/auth-alternate-link';
import { AuthPageHeader } from '@/features/auth/components/auth-page-header';
import { PhoneAuthForm } from '@/features/auth/components/phone-auth-form';
import { isAuthDevPhoneBypassEnabled } from '@/features/auth/lib/auth-identity';
import { getT } from '@/lib/i18n/t-server';

interface SignUpPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { locale } = await params;
  const tAuth = getT('auth', locale);

  return (
    <PageWrapper noTopPad className="max-w-5xl">
      <AuthPageHeader
        eyebrow={tAuth('signUpCardEyebrow')}
        title={tAuth('signUpTitle')}
        description={tAuth('signUpCardIntro')}
        titleId="sign-up-title"
      />

      <section className="relative overflow-hidden border-y border-border/50">
        <div className="kc-how-it-works-bg pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative flex flex-col items-center gap-8 px-6 py-10 sm:px-8 sm:py-12 md:py-16">
          <PhoneAuthForm
            devBypassEnabled={isAuthDevPhoneBypassEnabled()}
            intent="sign-up"
            labels={{
              accountExists: tAuth('phoneAuthGoToSignIn'),
              accountNotFound: tAuth('phoneAuthGoToSignUp'),
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
            href={localizeHref(locale, '/sign-in')}
            linkLabel={tAuth('signIn')}
            prompt={tAuth('authAlreadyMemberPrompt')}
          />
        </div>
      </section>
    </PageWrapper>
  );
}
