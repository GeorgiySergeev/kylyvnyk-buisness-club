// BLOCK: Placeholder page component — used for feature placeholders and scaffolding. Replace with real content before shipping.
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { PageBreadcrumbs } from '@/components/navigation/page-breadcrumbs';
import { getT } from '@/lib/i18n/t-server';

interface PlaceholderPageProps {
  descriptionKey: Parameters<ReturnType<typeof getT<'placeholders'>>>[0];
  locale: SupportedLocale;
  primaryActionKey: Parameters<ReturnType<typeof getT<'placeholders'>>>[0];
  titleKey: Parameters<ReturnType<typeof getT<'placeholders'>>>[0];
}

export function PlaceholderPage({
  descriptionKey,
  locale,
  primaryActionKey,
  titleKey,
}: PlaceholderPageProps) {
  const tPlaceholders = getT('placeholders', locale);

  return (
    <PageWrapper>
      <section className="mx-auto max-w-3xl rounded-ds-radius-lg border border-ds-border bg-ds-surface p-ds-space-6 shadow-ds-shadow-lg sm:p-ds-space-8">
        <div className="space-y-5">
          <PageBreadcrumbs currentLabel={tPlaceholders(titleKey)} locale={locale} />
          <h1 className="font-display text-3xl leading-tight text-ds-text sm:text-5xl">
            {tPlaceholders(titleKey)}
          </h1>
          <p className="max-w-2xl text-ds-text-base leading-8 text-ds-text-muted">
            {tPlaceholders(descriptionKey)}
          </p>
          <Link
            href={localizeHref(locale, '/')}
            className="inline-flex min-h-11 items-center justify-center rounded-ds-radius-md bg-ds-brand px-ds-space-5 py-ds-space-3 text-ds-text-sm font-bold text-ds-text-inverse transition-ds-transition-fast hover:bg-ds-brand-hover focus-visible:border-ds-accent focus-visible:ring-[3px] focus-visible:ring-ds-accent-subtle focus-visible:outline-none"
          >
            {tPlaceholders(primaryActionKey)}
          </Link>
        </div>
      </section>
    </PageWrapper>
  );
}
