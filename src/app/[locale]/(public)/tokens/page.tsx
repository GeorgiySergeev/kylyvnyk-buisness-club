import { notFound } from 'next/navigation';

import { CardPremium } from '@/components/ui/card-premium';
import { GoldButton } from '@/components/ui/gold-button';
import { Section } from '@/components/ui/section';
import { getT } from '@/lib/i18n/t-server';
import { cn } from '@/lib/utils';

interface PreviewBlockProps {
  title: string;
  className: string;
  textClassName?: string;
}

function PreviewBlock({ title, className, textClassName = 'text-foreground' }: PreviewBlockProps) {
  const t = getT('designSystem');

  return (
    <CardPremium className="space-y-4">
      <div className={cn('min-h-28 rounded-xl border border-border p-4', className)}>
        <p className={cn('text-sm font-semibold', textClassName)}>{t('sampleLabel')}</p>
        <p className={cn('mt-2 text-base', textClassName)}>{t('sampleText')}</p>
        <button
          type="button"
          className={cn(
            'focus-gold mt-4 min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold',
            textClassName,
          )}
        >
          {t('sampleButton')}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">{title}</p>
    </CardPremium>
  );
}

function TokenSwatch({ label, className }: { label: string; className: string }) {
  return (
    <CardPremium className="space-y-3">
      <div className={cn('h-20 rounded-xl border border-border', className)} />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </CardPremium>
  );
}

export default function TokensPreviewPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const t = getT('designSystem');

  return (
    <Section className="py-12 md:py-16">
      <div className="space-y-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold tracking-[0.32em] text-primary uppercase">
            {t('surfaceSection')}
          </p>
          <h1 className="h1 text-foreground">{t('tokensTitle')}</h1>
          <p className="body-lg text-muted-foreground">{t('tokensIntro')}</p>
        </div>

        <section aria-labelledby="surface-tokens" className="space-y-4">
          <h2 id="surface-tokens" className="h3 text-foreground">
            {t('surfaceSection')}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <TokenSwatch label={t('surfaceBg')} className="bg-background" />
            <TokenSwatch label={t('surfaceElevated')} className="bg-bgElev" />
            <TokenSwatch label={t('surfaceCard')} className="bg-card" />
            <TokenSwatch label={t('surfaceGold')} className="gold-gradient" />
          </div>
        </section>

        <section aria-labelledby="contrast-pairings" className="space-y-4">
          <h2 id="contrast-pairings" className="h3 text-foreground">
            {t('contrastSection')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <PreviewBlock title={t('pairingFgOnBg')} className="bg-background" />
            <PreviewBlock
              title={t('pairingFgMutedOnCard')}
              className="bg-card"
              textClassName="text-muted-foreground"
            />
            <PreviewBlock
              title={t('pairingGoldOnBg')}
              className="bg-background"
              textClassName="text-gold-400"
            />
            <PreviewBlock
              title={t('pairingOnGold')}
              className="gold-gradient"
              textClassName="text-fg-on-gold"
            />
          </div>
        </section>

        <section aria-labelledby="component-presets" className="space-y-4">
          <h2 id="component-presets" className="h3 text-foreground">
            {t('componentSection')}
          </h2>
          <CardPremium className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <GoldButton>{t('primaryCta')}</GoldButton>
              <GoldButton variant="outline">{t('secondaryCta')}</GoldButton>
              <GoldButton variant="ghost">{t('tertiaryCta')}</GoldButton>
            </div>
            <ul className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
              <li>{t('ruleBody')}</li>
              <li>{t('ruleGold')}</li>
              <li>{t('ruleFocus')}</li>
            </ul>
          </CardPremium>
        </section>
      </div>
    </Section>
  );
}
