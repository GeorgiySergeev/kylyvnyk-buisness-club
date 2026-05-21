import Link from 'next/link';

import { GoldButton } from '@/components/ui/gold-button';
import { getT } from '@/lib/i18n/t-server';

import { localizeHref, type SupportedLocale } from '../layout/navigation';

interface CtaRowProps {
  locale: SupportedLocale;
}

export function CtaRow({ locale }: CtaRowProps) {
  const t = getT('designSystem');

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <GoldButton asChild>
        <Link href={localizeHref(locale, '/sign-up')}>{t('primaryCta')}</Link>
      </GoldButton>
      <GoldButton asChild variant="outline">
        <Link href={localizeHref(locale, '/verify-card')}>{t('secondaryCta')}</Link>
      </GoldButton>
      <GoldButton asChild variant="ghost">
        <Link href={localizeHref(locale, '/directory')}>{t('tertiaryCta')}</Link>
      </GoldButton>
    </div>
  );
}
