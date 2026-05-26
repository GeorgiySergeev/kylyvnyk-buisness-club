import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
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
    <PageWrapper>
      <section className="mx-auto max-w-3xl space-y-6 rounded-lg border border-border bg-card p-6 shadow-xl shadow-black/20 sm:p-8">
        <div className="space-y-5">
          <p className="text-xs font-semibold tracking-[0.32em] text-primary uppercase">
            {tAuth('authCardEyebrow')}
          </p>
          <h1 className="font-display text-3xl leading-tight text-foreground sm:text-5xl">
            {tAuth('signOutTitle')}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-muted-foreground">
            {tAuth('signOutDescription')}
          </p>
        </div>
        <SignOutPanel
          redirectUrl={localizeHref(locale, '/')}
          submitLabel={tAuth('signOutSubmit')}
        />
      </section>
    </PageWrapper>
  );
}
