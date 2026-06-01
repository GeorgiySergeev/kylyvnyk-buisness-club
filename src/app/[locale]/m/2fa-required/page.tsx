import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthPageHeader } from '@/features/auth/components/auth-page-header';
import { TotpMfaForm } from '@/features/auth/components/totp-mfa-form';
import { requireRole } from '@/features/auth/lib/current-user';
import { getVerifiedTotpFactorId, hasVerifiedMfaInSession } from '@/features/auth/lib/mfa';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

/**
 * Prevent search engines from indexing this gate page.
 * It is a protected setup target for admins who have not yet completed MFA.
 */
export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

interface TwoFactorRequiredPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function TwoFactorRequiredPage({
  params,
}: TwoFactorRequiredPageProps) {
  const { locale } = await params;
  await requireRole(locale, ['ADMIN', 'OWNER']);

  if (await hasVerifiedMfaInSession()) {
    redirect(localizeHref(locale, '/admin'));
  }

  const verifiedFactorId = await getVerifiedTotpFactorId();
  const tAuth = getT('auth', locale);

  return (
    <PageWrapper noTopPad className="max-w-5xl">
      <AuthPageHeader
        eyebrow={tAuth('twoFactorRequiredEyebrow')}
        title={tAuth('twoFactorRequiredTitle')}
        description={tAuth('twoFactorRequiredDescription')}
        titleId="two-factor-required-title"
      />

      <section className="relative overflow-hidden border-y border-border/50">
        <div className="kc-how-it-works-bg pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative flex justify-center px-6 py-10 sm:px-8 sm:py-12 md:py-16">
          <TotpMfaForm
            initialFactorId={verifiedFactorId ?? undefined}
            labels={{
              challengeDescription: tAuth('mfaChallengeDescription'),
              challengeTitle: tAuth('mfaChallengeTitle'),
              codeHelp: tAuth('mfaCodeHelp'),
              codeLabel: tAuth('mfaCodeLabel'),
              loading: tAuth('mfaLoadingSetup'),
              qrAlt: tAuth('mfaQrAlt'),
              secretLabel: tAuth('mfaSecretLabel'),
              setupDescription: tAuth('mfaSetupDescription'),
              setupTitle: tAuth('mfaSetupTitle'),
              submit: tAuth('mfaSubmit'),
              submitting: tAuth('mfaSubmitting'),
            }}
            locale={locale}
            mode={verifiedFactorId ? 'challenge' : 'enroll'}
          />
        </div>
      </section>
    </PageWrapper>
  );
}
