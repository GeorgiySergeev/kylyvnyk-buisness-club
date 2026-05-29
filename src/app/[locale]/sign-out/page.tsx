import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthPageHeader } from '@/features/auth/components/auth-page-header';
import { SignOutPanel } from '@/features/auth/components/sign-out-panel';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface SignOutPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function SignOutPage({ params }: SignOutPageProps) {
  const { locale } = await params;
  const tAuth = getT('auth', locale);

  return (
    <PageWrapper noTopPad className="max-w-5xl">
      <AuthPageHeader
        eyebrow={tAuth('signOutEyebrow')}
        title={tAuth('signOutTitle')}
        description={tAuth('signOutDescription')}
        titleId="sign-out-title"
      />

      <section className="relative overflow-hidden border-y border-border/50">
        <div className="kc-how-it-works-bg pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative flex flex-col items-center px-6 py-10 sm:px-8 sm:py-12 md:py-16">
          <SignOutPanel
            redirectUrl={localizeHref(locale, '/')}
            submitLabel={tAuth('signOutSubmit')}
          />
        </div>
      </section>
    </PageWrapper>
  );
}
