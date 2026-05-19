# 01-hero-with-globe-and-cta.md

## Title

Landing Hero — globe visual + premium CTAs (mobile‑first)

## Objective

Build a mobile‑first hero with a subtle globe/planet visual, premium black & gold look, and 3 primary CTAs:

- Become a Member (Free)
- VIP Member ($19.99/mo)
- Business Partner (from $19.99/mo)

Server-aware CTAs: if signed‑in, adapt the primary action.

## Steps

1) Create a decorative globe background (CSS-only) with gold gradient highlights.
2) Implement Hero component with headline, subline, and CTA row.
3) Add VIP CTA button that starts checkout (client action posts to API).
4) Use server-side auth() to mildly adapt CTA labels/targets for signed users.

## Files to add/modify

- src/styles/hero.css
- src/components/common/vip-cta-button.tsx
- src/features/landing/hero.tsx
- src/app/(public)/page.tsx (assemble in B08 S05)

### src/styles/hero.css

```css
.hero-wrap {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: -20% -20% auto -20%;
  height: 120vh;
  pointer-events: none;
  opacity: 0.45;
  filter: blur(10px) saturate(1.05);
  background:
    radial-gradient(60% 60% at 60% 40%, hsla(46,85%,55%,0.2) 0%, transparent 60%),
    radial-gradient(40% 40% at 40% 60%, hsla(46,85%,42%,0.18) 0%, transparent 60%),
    radial-gradient(35% 35% at 70% 70%, rgba(255,255,255,0.06) 0%, transparent 60%);
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 50% 40%, hsla(46,85%,55%,0.08), transparent 45%),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 24px),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 24px);
  mask-image: radial-gradient(70% 70% at 60% 40%, black 0%, transparent 80%);
  opacity: 0.35;
}
```

### src/components/common/vip-cta-button.tsx

```tsx
'use client';

import { useState } from 'react';
import { GoldButton } from '@/components/ui/gold-button';

export function VipCtaButton({
  label = 'Become VIP — $19.99/mo'
}: { label?: string }) {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error(data?.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  return (
    <GoldButton onClick={startCheckout} loading={loading} aria-label="Start VIP membership checkout">
      {label}
    </GoldButton>
  );
}
```

### src/features/landing/hero.tsx

```tsx
import { auth } from '@clerk/nextjs/server';
import '@/styles/hero.css';
import { KylyvnykLogo } from '@/components/icons/brand/kylyvnyk-logo';
import { LinkButton } from '@/components/ui/link-button';
import { VipCtaButton } from '@/components/common/vip-cta-button';

export default async function LandingHero() {
  const { userId } = auth();

  return (
    <section className="hero-wrap border-b border-border">
      <div aria-hidden className="hero-bg" />
      <div aria-hidden className="hero-grid" />
      <div className="container relative z-10 py-14 md:py-20">
        <div className="flex items-center gap-3">
          <KylyvnykLogo className="h-10 w-10" />
          <div className="text-lg font-semibold tracking-wide">KYLYVNYK CLUB</div>
        </div>

        <h1 className="h1 mt-6 max-w-3xl">
          Save more. Grow your business. Live better.
        </h1>
        <p className="body-lg mt-3 max-w-2xl text-fgMuted">
          International private membership platform and premium partner network.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* 1) Become a Member (Free) */}
          <LinkButton
            href={userId ? '/member' : '/sign-up'}
            variant="gold"
            className="min-h-11"
          >
            {userId ? 'Go to Member Area' : 'Get a Club Card — Free'}
          </LinkButton>

          {/* 2) VIP Member */}
          {userId ? (
            <VipCtaButton />
          ) : (
            <LinkButton href="/sign-in" className="min-h-11">
              VIP Member — $19.99/mo
            </LinkButton>
          )}

          {/* 3) Business Partner */}
          <LinkButton
            href={userId ? '/business' : '/sign-up?intent=business'}
            className="min-h-11"
          >
            Submit a Business — from $19.99/mo
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
```

## Acceptance

- Hero renders with gold-tinted globe background, premium black UI.
- 3 large, mobile‑friendly CTAs present. Focus ring visible.
- If signed‑in: “Get a Club Card” → “Go to Member Area”; VIP button triggers checkout.
