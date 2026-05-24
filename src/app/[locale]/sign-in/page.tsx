import type { SupportedLocale } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { PhoneAuthForm } from '@/features/auth/components/phone-auth-form';
import { isAuthDevPhoneBypassEnabled } from '@/features/auth/lib/auth-identity';
import { getT } from '@/lib/i18n/t-server';

interface SignInPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params;
  const tAuth = getT('auth');

  return (
    <PageWrapper>
      <section className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-xs font-semibold tracking-[0.32em] text-primary uppercase">
            {tAuth('authCardEyebrow')}
          </p>
          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
            {tAuth('signInTitle')}
          </h1>
          <p className="max-w-xl text-base leading-8 text-muted-foreground">
            {tAuth('authCardIntro')}
          </p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <PhoneAuthForm
            devBypassEnabled={isAuthDevPhoneBypassEnabled()}
            labels={{
              code: tAuth('phoneAuthCodeLabel'),
              codeHelp: tAuth('phoneAuthCodeHelp'),
              devBypass: tAuth('phoneAuthDevBypass'),
              phone: tAuth('phoneAuthPhoneLabel'),
              phoneHelp: tAuth('phoneAuthPhoneHelp'),
              requestCode: tAuth('phoneAuthRequestCode'),
              submitting: tAuth('phoneAuthSubmitting'),
              verifyCode: tAuth('phoneAuthVerifyCode'),
            }}
            locale={locale}
          />
        </div>
      </section>
    </PageWrapper>
  );
}
