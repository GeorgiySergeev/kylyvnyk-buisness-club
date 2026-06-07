import type { SupportedLocale } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { VerifyCardLookupForm } from '@/features/cards/components/verify-card-lookup-form';
import { VERIFY_CARD_METADATA } from '@/features/cards/lib/verify-card-metadata';
import { getT } from '@/lib/i18n/t-server';

export const metadata = VERIFY_CARD_METADATA;

interface VerifyCardPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function VerifyCardPage({ params }: VerifyCardPageProps) {
  const { locale } = await params;
  const t = getT('cards', locale);

  return (
    <PageWrapper>
      <section className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-ds-radius-lg border border-ds-border bg-ds-surface shadow-ds-shadow-lg">
          <div className="space-y-4 border-b border-ds-border bg-gradient-to-br from-ds-surface via-ds-surface to-ds-accent-subtle/30 p-ds-space-6 sm:p-ds-space-8">
            <p className="text-ds-text-xs font-semibold tracking-[0.32em] text-ds-accent uppercase">
              {t('lookupEyebrow')}
            </p>
            <h1 className="font-display text-3xl leading-tight text-ds-text sm:text-5xl">
              {t('lookupTitle')}
            </h1>
            <p className="max-w-xl text-ds-text-base leading-8 text-ds-text-muted">
              {t('lookupDescription')}
            </p>
          </div>
          <div className="p-ds-space-6 sm:p-ds-space-8">
            <VerifyCardLookupForm
              buttonLabel={t('lookupSubmit')}
              emptyError={t('lookupEmptyError')}
              helpText={t('lookupHelp')}
              inputLabel={t('lookupInputLabel')}
              inputPlaceholder={t('lookupInputPlaceholder')}
              invalidError={t('lookupInvalidError')}
              locale={locale}
            />
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
