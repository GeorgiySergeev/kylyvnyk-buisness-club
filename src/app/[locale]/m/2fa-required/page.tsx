import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
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
    <PageWrapper>
      <section className="mx-auto max-w-3xl space-y-6 rounded-lg border border-border bg-card p-6 shadow-xl shadow-black/20 sm:p-8">
        <div className="space-y-4">
          <h1 className="font-display text-3xl leading-tight text-foreground sm:text-5xl">
            {tAuth('twoFactorRequiredTitle')}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-muted-foreground">
            {tAuth('twoFactorRequiredDescription')}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={localizeHref(locale, '/sign-in')}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {tAuth('twoFactorRequiredPrimaryAction')}
          </Link>
          <Link
            href={localizeHref(locale, '/')}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {tAuth('twoFactorRequiredSecondaryAction')}
          </Link>
        </div>
      </section>
    </PageWrapper>
  );
}

