import Link from 'next/link';

import { localizeHref,type SupportedLocale } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { getT } from '@/lib/i18n/t-server';

interface LocaleHomePageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params;
  const tAuth = getT('auth');
  const tFooter = getT('footer');
  const tNav = getT('nav');

  return (
    <PageWrapper className="flex flex-1 items-center" noTopPad>
      <section className="grid w-full gap-10 py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,24rem)] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm font-semibold tracking-[0.32em] text-primary uppercase">
            {tFooter('brand')}
          </p>
          <h1 className="font-display text-5xl leading-tight text-foreground sm:text-6xl">
            {tFooter('brand')}
          </h1>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={localizeHref(locale, '/directory')}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {tNav('directory')}
            </Link>
            <Link
              href={localizeHref(locale, '/sign-up')}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-transparent px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {tAuth('joinNow')}
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-8 shadow-2xl shadow-black/30">
          <div className="space-y-4">
            <p className="text-sm font-medium text-primary">{tNav('verifyCard')}</p>
            <div className="space-y-3">
              <div className="h-3 rounded-full bg-primary/70" />
              <div className="h-3 w-4/5 rounded-full bg-foreground/30" />
              <div className="h-3 w-3/5 rounded-full bg-foreground/20" />
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
