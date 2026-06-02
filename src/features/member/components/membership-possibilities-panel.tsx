'use client';

import {
  BookOpen,
  Building2,
  Check,
  CreditCard,
  Globe,
  Handshake,
  Headphones,
  Loader2,
  Sparkles,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ComponentType, ReactNode } from 'react';
import { useState, useTransition } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { createVipCheckoutAction } from '@/features/billing/actions/billing.action';
import { cn } from '@/lib/utils';

type BillingPeriod = 'monthly' | 'yearly';

export interface MembershipPossibilitiesLabels {
  billingMonthly: string;
  billingYearly: string;
  cancelVipScheduled: string;
  featureBusinessSubmit: string;
  featureDigitalCard: string;
  featureDirectory: string;
  featureDirectoryListing: string;
  featureIntroductions: string;
  featureOffers: string;
  featurePrioritySupport: string;
  featureVipNetworking: string;
  featuresDescription: string;
  featuresTitle: string;
  planCurrent: string;
  planGetStarted: string;
  planMemberPriceMonthly: string;
  planMemberPriceNote: string;
  planMemberPriceYearly: string;
  planMemberTitle: string;
  planPartnerPriceMonthly: string;
  planPartnerPriceNote: string;
  planPartnerPriceYearly: string;
  planPartnerTitle: string;
  planPopularBadge: string;
  planSubmitBusiness: string;
  planSwitchAnnual: string;
  planSwitchMonthly: string;
  planUpgradeVip: string;
  planUpgradeVipPending: string;
  planUpgradeVipError: string;
  planViewBusiness: string;
  status: string;
  planVipPriceMonthly: string;
  planVipPriceNoteMonthly: string;
  planVipPriceNoteYearly: string;
  planVipPriceYearly: string;
  planVipRequired: string;
  planVipTitle: string;
}

interface MembershipPossibilitiesPanelProps {
  business: {
    formattedStatus: string;
    slug: string;
    status: string;
  } | null;
  cancelAtPeriodEnd: boolean;
  hidePageHeader?: boolean;
  isVip: boolean;
  labels: MembershipPossibilitiesLabels;
  locale: SupportedLocale;
}

interface PlanFeature {
  icon: ComponentType<{ className?: string }>;
  included: boolean;
  label: string;
}

interface PlanCardConfig {
  cta: ReactNode;
  features: PlanFeature[];
  highlighted?: boolean;
  note: string;
  price: string;
  switchLink?: ReactNode;
  title: string;
}

export function MembershipPossibilitiesPanel({
  business,
  cancelAtPeriodEnd,
  hidePageHeader = false,
  isVip,
  labels,
  locale,
}: MembershipPossibilitiesPanelProps) {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutPending, startCheckoutTransition] = useTransition();

  function startVipCheckout() {
    setCheckoutError(null);
    startCheckoutTransition(async () => {
      const result = await createVipCheckoutAction(locale);

      if (!result.ok) {
        setCheckoutError(labels.planUpgradeVipError);
        return;
      }

      router.push(result.data.url);
    });
  }

  const memberFeatures: PlanFeature[] = [
    { icon: CreditCard, included: true, label: labels.featureDigitalCard },
    { icon: BookOpen, included: true, label: labels.featureDirectory },
    { icon: Tag, included: true, label: labels.featureOffers },
    { icon: Sparkles, included: false, label: labels.featureVipNetworking },
    { icon: Building2, included: false, label: labels.featureBusinessSubmit },
    { icon: Handshake, included: false, label: labels.featureIntroductions },
    { icon: Globe, included: false, label: labels.featureDirectoryListing },
    { icon: Headphones, included: false, label: labels.featurePrioritySupport },
  ];

  const vipFeatures: PlanFeature[] = [
    { icon: CreditCard, included: true, label: labels.featureDigitalCard },
    { icon: BookOpen, included: true, label: labels.featureDirectory },
    { icon: Tag, included: true, label: labels.featureOffers },
    { icon: Sparkles, included: true, label: labels.featureVipNetworking },
    { icon: Building2, included: true, label: labels.featureBusinessSubmit },
    { icon: Handshake, included: true, label: labels.featureIntroductions },
    { icon: Globe, included: false, label: labels.featureDirectoryListing },
    { icon: Headphones, included: false, label: labels.featurePrioritySupport },
  ];

  const partnerFeatures: PlanFeature[] = [
    { icon: CreditCard, included: true, label: labels.featureDigitalCard },
    { icon: BookOpen, included: true, label: labels.featureDirectory },
    { icon: Tag, included: true, label: labels.featureOffers },
    { icon: Sparkles, included: true, label: labels.featureVipNetworking },
    { icon: Building2, included: true, label: labels.featureBusinessSubmit },
    { icon: Handshake, included: true, label: labels.featureIntroductions },
    { icon: Globe, included: true, label: labels.featureDirectoryListing },
    { icon: Headphones, included: true, label: labels.featurePrioritySupport },
  ];

  const memberPlan: PlanCardConfig = {
    cta: (
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full rounded-lg border-border/50 bg-transparent text-white hover:bg-white/5"
        disabled
      >
        {isVip ? labels.planGetStarted : labels.planCurrent}
      </Button>
    ),
    features: memberFeatures,
    note: labels.planMemberPriceNote,
    price: billingPeriod === 'monthly' ? labels.planMemberPriceMonthly : labels.planMemberPriceYearly,
    switchLink:
      billingPeriod === 'monthly' ? (
        <button
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={() => setBillingPeriod('yearly')}
          type="button"
        >
          {labels.planSwitchAnnual}
        </button>
      ) : (
        <button
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={() => setBillingPeriod('monthly')}
          type="button"
        >
          {labels.planSwitchMonthly}
        </button>
      ),
    title: labels.planMemberTitle,
  };

  const vipPlan: PlanCardConfig = {
    cta: isVip ? (
      <Button
        type="button"
        className="min-h-11 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        disabled
      >
        {labels.planCurrent}
      </Button>
    ) : (
      <Button
        type="button"
        className="min-h-11 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={checkoutPending}
        onClick={startVipCheckout}
      >
        {checkoutPending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
        {checkoutPending ? labels.planUpgradeVipPending : labels.planUpgradeVip}
      </Button>
    ),
    features: vipFeatures,
    highlighted: true,
    note:
      billingPeriod === 'monthly' ? labels.planVipPriceNoteMonthly : labels.planVipPriceNoteYearly,
    price: billingPeriod === 'monthly' ? labels.planVipPriceMonthly : labels.planVipPriceYearly,
    switchLink:
      billingPeriod === 'monthly' ? (
        <button
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={() => setBillingPeriod('yearly')}
          type="button"
        >
          {labels.planSwitchAnnual}
        </button>
      ) : (
        <button
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={() => setBillingPeriod('monthly')}
          type="button"
        >
          {labels.planSwitchMonthly}
        </button>
      ),
    title: labels.planVipTitle,
  };

  const partnerPlan: PlanCardConfig = {
    cta: !isVip ? (
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full rounded-lg border-border/50 bg-transparent text-fg/40"
        disabled
      >
        {labels.planVipRequired}
      </Button>
    ) : business?.status === 'PUBLISHED' ? (
      <Button asChild className="min-h-11 w-full rounded-lg" type="button" variant="outline">
        <Link href={localizeHref(locale, `/directory/${business.slug}`)}>{labels.planViewBusiness}</Link>
      </Button>
    ) : business ? (
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full rounded-lg border-border/50 bg-transparent text-fg/60"
        disabled
      >
        {labels.status}: {business.formattedStatus}
      </Button>
    ) : (
      <Button asChild className="min-h-11 w-full rounded-lg" type="button" variant="outline">
        <Link href={localizeHref(locale, '/m/business/new')}>{labels.planSubmitBusiness}</Link>
      </Button>
    ),
    features: partnerFeatures,
    note: labels.planPartnerPriceNote,
    price:
      billingPeriod === 'monthly' ? labels.planPartnerPriceMonthly : labels.planPartnerPriceYearly,
    switchLink:
      billingPeriod === 'monthly' ? (
        <button
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={() => setBillingPeriod('yearly')}
          type="button"
        >
          {labels.planSwitchAnnual}
        </button>
      ) : (
        <button
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={() => setBillingPeriod('monthly')}
          type="button"
        >
          {labels.planSwitchMonthly}
        </button>
      ),
    title: labels.planPartnerTitle,
  };

  const plans = [memberPlan, vipPlan, partnerPlan];

  return (
    <section
      aria-labelledby={hidePageHeader ? undefined : 'membership-possibilities-title'}
      className="space-y-8"
    >
      {hidePageHeader ? null : (
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <h2
            id="membership-possibilities-title"
            className="font-sans text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            {labels.featuresTitle}
          </h2>
          <p className="text-sm leading-relaxed text-fg/50 sm:text-base">{labels.featuresDescription}</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <span
          className={cn(
            'text-sm font-medium',
            billingPeriod === 'monthly' ? 'text-white' : 'text-fg/45',
          )}
        >
          {labels.billingMonthly}
        </span>
        <button
          aria-checked={billingPeriod === 'yearly'}
          aria-label={`${labels.billingMonthly} / ${labels.billingYearly}`}
          className="relative inline-flex h-7 w-12 shrink-0 rounded-full border border-border/50 bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={() => setBillingPeriod((current) => (current === 'monthly' ? 'yearly' : 'monthly'))}
          role="switch"
          type="button"
        >
          <span
            className={cn(
              'absolute top-0.5 size-6 rounded-full bg-primary transition-transform',
              billingPeriod === 'yearly' ? 'translate-x-5' : 'translate-x-0.5',
            )}
          />
        </button>
        <span
          className={cn(
            'text-sm font-medium',
            billingPeriod === 'yearly' ? 'text-white' : 'text-fg/45',
          )}
        >
          {labels.billingYearly}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-4 xl:gap-6">
        {plans.map((plan) => (
          <article
            className={cn(
              'relative flex flex-col rounded-xl border bg-card/30 p-6 sm:p-8',
              plan.highlighted
                ? 'border-primary/60 shadow-lg shadow-primary/10'
                : 'border-border/50',
            )}
            key={plan.title}
          >
            {plan.highlighted ? (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-px text-[10px] font-medium text-primary-foreground">
                {labels.planPopularBadge}
              </span>
            ) : null}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{plan.title}</h3>
              <div className="space-y-1">
                <p className="font-sans text-4xl font-bold tracking-tight text-white">{plan.price}</p>
                <p className="text-sm text-fg/45">{plan.note}</p>
              </div>
              {plan.switchLink}
            </div>

            <div className="mt-6">{plan.cta}</div>

            <ul className="mt-8 space-y-4">
              {plan.features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li
                    className={cn(
                      'flex items-start gap-3 text-sm',
                      feature.included ? 'text-white' : 'text-fg/30 line-through',
                    )}
                    key={feature.label}
                  >
                    <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    <span className="min-w-0 flex-1">{feature.label}</span>
                    {feature.included ? (
                      <Check aria-hidden="true" className="size-4 shrink-0 text-primary" />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>

      {checkoutError ? (
        <p className="text-center text-sm text-destructive" role="alert">
          {checkoutError}
        </p>
      ) : null}

      {isVip && cancelAtPeriodEnd ? (
        <p className="text-center text-sm font-medium text-primary">{labels.cancelVipScheduled}</p>
      ) : null}
    </section>
  );
}
