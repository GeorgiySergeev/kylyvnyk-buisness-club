import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { getT } from '@/lib/i18n/t-server';

interface PlaceholderPageProps {
  descriptionKey: Parameters<ReturnType<typeof getT<'placeholders'>>>[0];
  eyebrowKey: Parameters<ReturnType<typeof getT<'placeholders'>>>[0];
  locale: SupportedLocale;
  primaryActionKey: Parameters<ReturnType<typeof getT<'placeholders'>>>[0];
  titleKey: Parameters<ReturnType<typeof getT<'placeholders'>>>[0];
}

export function PlaceholderPage({
  descriptionKey,
  eyebrowKey,
  locale,
  primaryActionKey,
  titleKey,
}: PlaceholderPageProps) {
  const tPlaceholders = getT('placeholders', locale);

  return (
    <PageWrapper>
      <section className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-6 shadow-xl shadow-black/20 sm:p-8">
        <div className="space-y-5">
          <p className="text-xs font-semibold tracking-[0.32em] text-primary uppercase">
            {tPlaceholders(eyebrowKey)}
          </p>
          <h1 className="font-display text-3xl leading-tight text-foreground sm:text-5xl">
            {tPlaceholders(titleKey)}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-muted-foreground">
            {tPlaceholders(descriptionKey)}
          </p>
          <Link
            href={localizeHref(locale, '/')}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {tPlaceholders(primaryActionKey)}
          </Link>
        </div>
      </section>
    </PageWrapper>
  );
}
