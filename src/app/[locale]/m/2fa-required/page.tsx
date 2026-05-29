import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthPageHeader } from '@/features/auth/components/auth-page-header';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface TwoFactorRequiredPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function TwoFactorRequiredPage({
  params,
}: TwoFactorRequiredPageProps) {
  const { locale } = await params;
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

        <div className="relative flex flex-col items-center gap-3 px-6 py-10 sm:flex-row sm:justify-center sm:px-8 sm:py-12 md:py-16">
          <Link
            href={localizeHref(locale, '/sign-in')}
            className="inline-flex min-h-11 w-full max-w-xs items-center justify-center gap-2 rounded-md border border-border/50 bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
          >
            {tAuth('twoFactorRequiredPrimaryAction')}
            <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </Link>
          <Link
            href={localizeHref(locale, '/')}
            className="inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-md border border-border/50 bg-transparent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
          >
            {tAuth('twoFactorRequiredSecondaryAction')}
          </Link>
        </div>
      </section>
    </PageWrapper>
  );
}
