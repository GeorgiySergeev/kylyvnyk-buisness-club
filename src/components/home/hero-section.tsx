import { Briefcase, Crown, Gem, UserPlus } from 'lucide-react';
import Link from 'next/link';

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
  vipAction: string;
  vipActionPrice: string;
  memberAction: string;
  memberActionPrice: string;
  partnerAction: string;
  partnerActionPrice: string;
}

function MembershipCardSvg() {
  return (
    <div
      className="relative mx-auto w-full max-w-sm lg:max-w-none"
      style={{ filter: 'drop-shadow(0 0 40px rgba(255,215,0,0.18))' }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 380 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        role="img"
        aria-label="KYLYVNYK CLUB digital membership card"
      >
        <defs>
          <linearGradient id="cardBg" x1="0" y1="0" x2="380" y2="230" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1f1f25" />
            <stop offset="100%" stopColor="#0a0a0b" />
          </linearGradient>
          <linearGradient id="goldLine" x1="0" y1="0" x2="380" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(212,175,55,0)" />
            <stop offset="30%" stopColor="#d4af37" />
            <stop offset="70%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="rgba(212,175,55,0)" />
          </linearGradient>
          <linearGradient id="chipGrad" x1="0" y1="0" x2="44" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c9a84c" />
            <stop offset="100%" stopColor="#8a6d20" />
          </linearGradient>
          <radialGradient id="glowCircle" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(212,175,55,0.12)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0)" />
          </radialGradient>
        </defs>

        {/* Card body */}
        <rect width="380" height="230" rx="16" fill="url(#cardBg)" />
        <rect width="380" height="230" rx="16" stroke="#d4af37" strokeOpacity="0.35" strokeWidth="1" />

        {/* Subtle glow orb */}
        <ellipse cx="310" cy="60" rx="120" ry="120" fill="url(#glowCircle)" />

        {/* Top gold accent line */}
        <line x1="0" y1="0" x2="380" y2="0" stroke="url(#goldLine)" strokeWidth="2" />

        {/* Crown icon area */}
        <g transform="translate(28, 24)">
          <rect width="36" height="36" rx="8" fill="rgba(212,175,55,0.12)" stroke="#d4af37" strokeOpacity="0.4" strokeWidth="1" />
          {/* Crown shape */}
          <path d="M9 24 L9 26 L27 26 L27 24 L23 14 L18 20 L13 14 Z" fill="#d4af37" />
          <circle cx="9" cy="14" r="2" fill="#d4af37" />
          <circle cx="27" cy="14" r="2" fill="#d4af37" />
        </g>

        {/* Brand name */}
        <text x="74" y="36" fontFamily="Inter, system-ui, sans-serif" fontSize="11" fontWeight="700" letterSpacing="3" fill="#d4af37">
          KYLYVNYK
        </text>
        <text x="74" y="50" fontFamily="Inter, system-ui, sans-serif" fontSize="8" fontWeight="400" letterSpacing="2.5" fill="rgba(168,168,160,0.8)">
          BUSINESS CLUB
        </text>

        {/* Gold divider */}
        <line x1="28" y1="72" x2="352" y2="72" stroke="#d4af37" strokeOpacity="0.2" strokeWidth="0.5" />

        {/* Chip */}
        <g transform="translate(28, 88)">
          <rect width="44" height="32" rx="5" fill="url(#chipGrad)" />
          <line x1="0" y1="11" x2="44" y2="11" stroke="rgba(0,0,0,0.3)" strokeWidth="0.7" />
          <line x1="0" y1="21" x2="44" y2="21" stroke="rgba(0,0,0,0.3)" strokeWidth="0.7" />
          <line x1="15" y1="0" x2="15" y2="32" stroke="rgba(0,0,0,0.3)" strokeWidth="0.7" />
          <line x1="29" y1="0" x2="29" y2="32" stroke="rgba(0,0,0,0.3)" strokeWidth="0.7" />
        </g>

        {/* Status badge */}
        <rect x="88" y="93" width="90" height="22" rx="5" fill="rgba(212,175,55,0.12)" stroke="#d4af37" strokeOpacity="0.35" strokeWidth="0.8" />
        <circle cx="100" cy="104" r="3" fill="#22c55e" />
        <text x="108" y="108" fontFamily="Inter, system-ui, sans-serif" fontSize="8" fontWeight="500" letterSpacing="0.5" fill="#d4af37">
          ACTIVE MEMBER
        </text>

        {/* Card number */}
        <text x="28" y="152" fontFamily="'JetBrains Mono', 'Courier New', monospace" fontSize="14" fontWeight="500" letterSpacing="4" fill="rgba(245,245,240,0.85)">
          KCLUB · 2026 · 001
        </text>

        {/* Bottom bar */}
        <line x1="28" y1="170" x2="352" y2="170" stroke="#d4af37" strokeOpacity="0.15" strokeWidth="0.5" />

        {/* Member label & expiry */}
        <text x="28" y="188" fontFamily="Inter, system-ui, sans-serif" fontSize="7" fontWeight="400" letterSpacing="1.5" fill="rgba(168,168,160,0.6)">
          MEMBER NAME
        </text>
        <text x="28" y="202" fontFamily="Inter, system-ui, sans-serif" fontSize="10" fontWeight="500" fill="rgba(245,245,240,0.7)">
          VIP Member
        </text>

        <text x="280" y="188" fontFamily="Inter, system-ui, sans-serif" fontSize="7" fontWeight="400" letterSpacing="1.5" fill="rgba(168,168,160,0.6)">
          VALID THRU
        </text>
        <text x="280" y="202" fontFamily="Inter, system-ui, sans-serif" fontSize="10" fontWeight="500" fill="rgba(245,245,240,0.7)">
          12/28
        </text>

        {/* Decorative circles */}
        <circle cx="330" cy="180" r="20" fill="rgba(212,175,55,0.08)" />
        <circle cx="350" cy="180" r="20" fill="rgba(201,168,76,0.06)" />
      </svg>

      {/* Subtle outer glow ring */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.15), 0 0 60px rgba(255,215,0,0.08)' }}
      />
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
  vipAction,
  vipActionPrice,
  memberAction,
  memberActionPrice,
  partnerAction,
  partnerActionPrice,
}: HeroSectionProps) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(212,175,55,0.07) 0%, transparent 60%), #0a0a0b',
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'linear-gradient(180deg, black 0%, transparent 85%)',
        }}
        aria-hidden="true"
      />

      <div className="relative grid gap-10 px-6 py-12 md:px-12 md:py-20 lg:grid-cols-[55fr_45fr] lg:items-center lg:gap-16 lg:px-16 lg:py-24">
        {/* Left column — text + CTAs */}
        <div className="flex flex-col gap-6 kc-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
              <Crown className="size-4 text-primary" aria-hidden="true" />
            </div>
            <span className="text-[10px] tracking-[5px] text-primary uppercase md:text-xs">
              {heroEyebrow}
            </span>
          </div>

          <div className="space-y-3">
            <h1
              className="font-display font-bold leading-none text-primary"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.01em' }}
            >
              {heroTitle}
            </h1>
            <p className="max-w-xl text-lg font-light leading-relaxed text-fg/80 md:text-xl">
              {heroSubtitle}{' '}
              <span className="font-medium text-primary">{heroSubtitleHighlight}</span>
            </p>
          </div>

          {/* Divider */}
          <div className="h-px w-16 bg-primary/40" />

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {isAuthenticated ? (
              <>
                <Button
                  asChild
                  className="h-12 gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-accent-hover"
                >
                  <Link href={localizeHref(locale, '/m/dashboard')}>
                    <Crown className="size-4" aria-hidden="true" />
                    {memberDashboard}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 gap-2 rounded-lg border-primary/40 px-6 text-sm hover:border-primary/70 hover:bg-primary/10"
                >
                  <Link href={localizeHref(locale, '/directory')}>
                    <Briefcase className="size-4" aria-hidden="true" />
                    {secondaryCta}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  className="h-12 gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-accent-hover"
                >
                  <Link href={localizeHref(locale, '/sign-up')}>
                    <Gem className="size-4" aria-hidden="true" />
                    <span>{vipAction}</span>
                    <span className="ml-1 rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-medium">
                      {vipActionPrice}
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 gap-2 rounded-lg border-primary/40 px-5 text-sm hover:border-primary/70 hover:bg-primary/10"
                >
                  <Link href={localizeHref(locale, '/sign-up')}>
                    <UserPlus className="size-4 text-primary" aria-hidden="true" />
                    <span>{memberAction}</span>
                    <span className="text-xs text-muted-foreground">{memberActionPrice}</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 gap-2 rounded-lg border-primary/40 px-5 text-sm hover:border-primary/70 hover:bg-primary/10"
                >
                  <Link href={localizeHref(locale, '/sign-up')}>
                    <Briefcase className="size-4 text-primary" aria-hidden="true" />
                    <span>{partnerAction}</span>
                    <span className="text-xs text-muted-foreground">{partnerActionPrice}</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Right column — membership card visual */}
        <div className="kc-fade-in-delay-1 flex items-center justify-center lg:justify-end">
          <MembershipCardSvg />
        </div>
      </div>
    </section>
  );
}
