import { Briefcase, Crown, Gem, UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  locale: SupportedLocale;
  isAuthenticated: boolean;
  heroTitle: string;
  heroEyebrow: string;
  heroSubtitle: string;
  heroSubtitleHighlight: string;
  memberDashboard: string;
  secondaryCta: string;
  vipAction: string;
  vipActionPrice: string;
  memberAction: string;
  memberActionPrice: string;
  partnerAction: string;
  partnerActionPrice: string;
}

export function HeroSection({
  locale,
  isAuthenticated,
  heroTitle,
  heroEyebrow,
  heroSubtitle,
  heroSubtitleHighlight,
  memberDashboard,
  secondaryCta,
  vipAction,
  vipActionPrice,
  memberAction,
  memberActionPrice,
  partnerAction,
  partnerActionPrice,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
          alt=""
          aria-hidden="true"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/50 to-bg/90" />
      </div>
      <div className="relative flex flex-col items-center gap-6 px-6 py-12 text-center md:px-12 md:py-20 lg:rounded-none lg:px-20 lg:py-28">
        <Crown className="size-8 text-primary" aria-hidden="true" />
        <div className="space-y-2">
          <h1 className="font-display text-4xl tracking-[3.2px] text-primary md:text-5xl lg:text-6xl">
            {heroTitle}
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-primary" />
            <span className="text-[10px] tracking-[6.4px] text-primary md:text-xs">
              {heroEyebrow}
            </span>
            <div className="h-px w-12 bg-primary" />
          </div>
        </div>
        <p className="max-w-2xl text-lg font-light text-fg md:text-2xl">
          {heroSubtitle}{' '}
          <span className="text-primary">{heroSubtitleHighlight}</span>
        </p>
        <div className={cn('flex w-full max-w-lg flex-col gap-3 md:flex-row md:gap-4')}>
          {isAuthenticated ? (
            <>
              <Button asChild className="flex-1 bg-primary text-primary-foreground px-6 py-6 text-sm">
                <Link href={localizeHref(locale, '/m/dashboard')}>
                  <Crown className="size-4" />
                  {memberDashboard}
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 border-primary/50 px-6 py-6 text-sm">
                <Link href={localizeHref(locale, '/directory')}>
                  <Briefcase className="size-4" />
                  {secondaryCta}
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="w-full bg-primary text-primary-foreground px-6 py-6 text-sm md:flex-1">
                <Link href={localizeHref(locale, '/sign-up')}>
                  <Gem className="size-4" />
                  <span className="flex-1 text-left">{vipAction}</span>
                  <span className="text-xs opacity-80">{vipActionPrice}</span>
                </Link>
              </Button>
              <div className="flex w-full flex-col gap-3 md:hidden">
                <Button asChild variant="outline" className="w-full border-primary/50 bg-card/40 px-6 py-6 text-sm">
                  <Link href={localizeHref(locale, '/sign-up')}>
                    <span className="flex items-center gap-2">
                      <UserPlus className="size-4" />
                      {memberAction}
                    </span>
                    <span className="text-xs text-muted-foreground">{memberActionPrice}</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-primary/50 bg-card/40 px-6 py-6 text-sm">
                  <Link href={localizeHref(locale, '/sign-up')}>
                    <span className="flex items-center gap-2">
                      <Briefcase className="size-4" />
                      {partnerAction}
                    </span>
                    <span className="text-xs text-muted-foreground">{partnerActionPrice}</span>
                  </Link>
                </Button>
              </div>
              <div className="hidden gap-4 md:flex md:flex-row">
                <Button asChild variant="outline" className="border-primary/50 bg-card/40 px-6 py-6 text-sm">
                  <Link href={localizeHref(locale, '/sign-up')}>
                    <UserPlus className="size-4 text-primary" />
                    {memberAction}
                    <span className="ml-2 text-xs text-muted-foreground">{memberActionPrice}</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-primary/50 bg-card/40 px-6 py-6 text-sm">
                  <Link href={localizeHref(locale, '/sign-up')}>
                    <Briefcase className="size-4 text-primary" />
                    {partnerAction}
                    <span className="ml-2 text-xs text-muted-foreground">{partnerActionPrice}</span>
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
