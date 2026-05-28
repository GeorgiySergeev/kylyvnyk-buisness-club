// src/components/home/hero-section.tsx
import { Crown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import mapImg from '@/assets/images/map.webp';
import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';

export interface HeroSectionProps {
  locale: SupportedLocale;
  isAuthenticated: boolean;
  heroTitle: string;
  heroEyebrow: string;
  heroSubtitle: string;
  heroSubtitleHighlight: string;
  memberDashboard: string;
  secondaryCta: string;
  tierMemberTitle: string;
  tierMemberDesc: string;
  tierVipTitle: string;
  tierVipDesc: string;
  tierPartnerTitle: string;
  tierPartnerDesc: string;
  tierApplyCta: string;
}

function GoldCrest() {
  return (
    <div className="flex justify-center mb-4 sm:mb-6">
      <div className="relative flex items-center justify-center size-20 sm:size-24 rounded-full border border-primary/25 bg-[#0a0a0b]/60 backdrop-blur-md shadow-[0_0_25px_rgba(212,175,55,0.08)] transition-all duration-500 hover:border-primary/55 hover:shadow-[0_0_45px_rgba(212,175,55,0.22)]">
        <svg viewBox="0 0 100 100" className="size-11 sm:size-14 fill-primary text-primary">
          <circle cx="50" cy="8" r="1.5" />
          <circle cx="50" cy="92" r="1.5" />
          <circle cx="8" cy="50" r="1.5" />
          <circle cx="92" cy="50" r="1.5" />

          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="opacity-20"
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="3 3"
            className="opacity-40"
          />

          <g transform="translate(18, 18)">
            <path d="M14 36 L14 40 L50 40 L50 36 L43 20 L32 29 L21 20 Z" />
            <circle cx="14" cy="20" r="2.5" />
            <circle cx="50" cy="20" r="2.5" />
            <circle cx="32" cy="15" r="3" />

            <path
              d="M4 36 C1 26, 7 16, 15 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="opacity-40"
            />
            <path
              d="M60 36 C63 26, 57 16, 49 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="opacity-40"
            />
          </g>
        </svg>
        <div className="absolute inset-0 rounded-full bg-primary/5 blur-md pointer-events-none" />
      </div>
    </div>
  );
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
  tierMemberTitle,
  tierMemberDesc,
  tierVipTitle,
  tierVipDesc,
  tierPartnerTitle,
  tierPartnerDesc,
  tierApplyCta,
}: HeroSectionProps) {
  const targetLink = isAuthenticated
    ? localizeHref(locale, '/m/dashboard')
    : localizeHref(locale, '/sign-up');

  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-[#0a0a0b] py-12 px-4 sm:px-8 md:py-20 lg:py-24">
      {/* Background world map with luxury radial shading */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-20">
        <Image
          src={mapImg}
          alt="KYLYVNYK World Map"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/10 via-[#0a0a0b]/80 to-[#0a0a0b]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(212,175,55,0.05)_0%,transparent_60%)]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-15"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '54px 54px',
          maskImage: 'linear-gradient(180deg, black 0%, transparent 90%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Center brand crest and header info with mobile-first text sizes */}
        <div className="text-center space-y-3 xs:space-y-4 max-w-4xl mx-auto mb-8 xs:mb-10 sm:mb-14 md:mb-16 kc-fade-in">
          <GoldCrest />
          <span className="text-[9px] xs:text-[10px] sm:text-xs font-semibold tracking-[4px] xs:tracking-[5px] sm:tracking-[6px] text-primary uppercase block">
            {heroEyebrow}
          </span>
          <h1 className="font-display text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-none break-words hyphens-auto">
            {heroTitle}
            <span className="block mt-2 sm:mt-3 font-display font-light text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-[3px] xs:tracking-[4px] sm:tracking-[6px] md:tracking-[10px] text-primary uppercase break-words hyphens-auto">
              {heroSubtitle}
            </span>
          </h1>
          <div className="h-px w-20 sm:w-28 bg-gradient-to-r from-transparent via-primary/45 to-transparent mx-auto my-4 sm:my-6" />
          <p className="text-[8px] xs:text-[9px] sm:text-[10px] font-semibold tracking-[2px] xs:tracking-[3px] sm:tracking-[4px] text-fg/60 uppercase max-w-xl mx-auto leading-relaxed px-2 break-words">
            {heroSubtitleHighlight}
          </p>
        </div>

        {/* Membership Tier Cards - Responsive layout */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 w-full max-w-5xl mx-auto kc-fade-in-delay-1">
          {/* Card 1: MEMBER */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-primary/15 bg-[#16161a]/60 backdrop-blur-md p-4 xs:p-5 sm:p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_25px_rgba(212,175,55,0.06)]">
            <div className="space-y-2 sm:space-y-4">
              <h3 className="text-[10px] sm:text-xs font-bold tracking-[2px] sm:tracking-[3px] text-primary uppercase">
                {tierMemberTitle}
              </h3>
              <p className="text-xs sm:text-sm font-light text-fg/75 leading-relaxed md:min-h-[48px]">
                {tierMemberDesc}
              </p>
            </div>
            <div className="mt-4 sm:mt-8 pt-3 sm:pt-4 border-t border-primary/5">
              <Link
                href={targetLink}
                className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-primary hover:text-accent-hover transition-colors group/link"
              >
                <span className="underline underline-offset-4">{tierApplyCta}</span>
                <span className="transition-transform duration-300 group-hover/link:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Card 2: VIP MEMBER (Highlighted) */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-primary/45 bg-[#1d1d22]/80 backdrop-blur-md p-4 xs:p-5 sm:p-8 shadow-[0_0_25px_rgba(212,175,55,0.06)] sm:shadow-[0_0_35px_rgba(212,175,55,0.08)] transition-all duration-300 hover:border-primary/75 hover:shadow-[0_0_45px_rgba(212,175,55,0.15)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none" />

            <div className="space-y-2 sm:space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] sm:text-xs font-bold tracking-[2px] sm:tracking-[3px] text-primary uppercase flex items-center gap-1.5">
                  <Crown className="size-3.5 text-primary" />
                  {tierVipTitle}
                </h3>
                <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[8px] font-bold tracking-wider text-primary uppercase">
                  POPULAR
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-fg leading-relaxed md:min-h-[48px]">
                {tierVipDesc}
              </p>
            </div>

            <div className="mt-4 sm:mt-8 pt-3 sm:pt-4 border-t border-primary/10 relative z-10">
              <Link
                href={targetLink}
                className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-primary hover:text-accent-hover transition-colors group/link"
              >
                <span className="underline underline-offset-4">{tierApplyCta}</span>
                <span className="transition-transform duration-300 group-hover/link:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Card 3: PARTNER */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-primary/15 bg-[#16161a]/60 backdrop-blur-md p-4 xs:p-5 sm:p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_25px_rgba(212,175,55,0.06)]">
            <div className="space-y-2 sm:space-y-4">
              <h3 className="text-[10px] sm:text-xs font-bold tracking-[2px] sm:tracking-[3px] text-primary uppercase">
                {tierPartnerTitle}
              </h3>
              <p className="text-xs sm:text-sm font-light text-fg/75 leading-relaxed md:min-h-[48px]">
                {tierPartnerDesc}
              </p>
            </div>
            <div className="mt-4 sm:mt-8 pt-3 sm:pt-4 border-t border-primary/5">
              <Link
                href={targetLink}
                className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-primary hover:text-accent-hover transition-colors group/link"
              >
                <span className="underline underline-offset-4">{tierApplyCta}</span>
                <span className="transition-transform duration-300 group-hover/link:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard/Directory Quick Actions */}
        {isAuthenticated && (
          <div className="mt-10 flex flex-wrap gap-4 justify-center kc-fade-in-delay-2">
            <Button
              asChild
              className="h-10 gap-2 rounded-lg bg-background px-5 text-xs font-semibold text-primary-foreground hover:bg-accent-hover transition-all"
            >
              <Link href={localizeHref(locale, '/m/dashboard')}>
                <Crown className="size-3.5" aria-hidden="true" />
                {memberDashboard}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 gap-2 rounded-lg border-primary/30 bg-transparent text-xs hover:border-primary/60 hover:bg-primary/5 text-primary transition-all"
            >
              <Link href={localizeHref(locale, '/directory')}>{secondaryCta}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
