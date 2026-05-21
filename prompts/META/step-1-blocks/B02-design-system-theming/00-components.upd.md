## Всё принято. Вот разбор каждой ошибки и полный корректный код.

---

### Маппинг ошибок → исправлений

| #   | Severity | Моя ошибка                                                           | Исправление                                                                                             |
| --- | -------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | High     | Роли `member/coach` не существуют в SPEC                             | `guest \| FREE \| BUSINESS \| ADMIN`                                                                    |
| 2   | High     | Nav: Home/Programme/Schedule/Admin                                   | Nav по ролям из SPEC: Directory, Verify Card, Dashboard, Recommend a Client, Admin                      |
| 3   | High     | `redirect('/uk')`, `lang="uk"`, `generateStaticParams → ['uk','en']` | `redirect('/en')`, `lang="en"`, `generateStaticParams → ['en']` only                                    |
| 4   | High     | Footer: "Premium training environment" / "membership organisation"   | Обязательная фраза из SPEC.md: **"independent private membership platform"** + TODO-маркер для проверки |
| 5   | Medium   | UI-строки хардкожены в JSX                                           | `src/messages/en.json` — единый источник строк; `t-server.ts` стаб, зеркалящий next-intl API            |
| 6   | Medium   | `@tailwind base/components/utilities` (v3)                           | `@import "tailwindcss"` (v4)                                                                            |

---

### Новые файлы (добавляются в B02)

#### `src/messages/en.json`

```json
{
  "nav": {
    "directory": "Directory",
    "verifyCard": "Verify Card",
    "dashboard": "Dashboard",
    "recommendClient": "Recommend a Client",
    "adminPanel": "Admin"
  },
  "auth": {
    "signIn": "Sign In",
    "joinNow": "Join Now",
    "account": "My Account",
    "signOut": "Sign Out"
  },
  "footer": {
    "brand": "Kylyvnyk Club",
    "tagline": "Independent private membership platform.",
    "legalDisclaimer": "Kylyvnyk Club is an independent private membership platform. Membership and access to club services are subject to our Terms of Service and Privacy Policy. By accessing or using this platform, you agree to be bound by these terms.",
    "allRightsReserved": "All rights reserved.",
    "privacyPolicy": "Privacy Policy",
    "termsOfService": "Terms of Service",
    "cookiePolicy": "Cookie Policy",
    "contact": "Contact"
  },
  "a11y": {
    "skipToContent": "Skip to main content",
    "siteFooter": "Site footer",
    "footerNav": "Footer navigation",
    "primaryNav": "Primary navigation",
    "mobileNav": "Mobile navigation",
    "openMenu": "Open menu",
    "closeMenu": "Close menu"
  }
}
```

---

#### `src/lib/i18n/t-server.ts`

```typescript
/**
 * B02-safe synchronous translation stub for Server Components.
 *
 * Mirrors next-intl's getTranslations() call-site signature exactly,
 * so B05 migration is a two-line change per Server Component:
 *
 *   BEFORE (B02):  const t = getT('nav');
 *   AFTER  (B05):  const t = await getTranslations('nav');
 *
 * The returned t(key) call is identical in both versions — no other
 * changes needed at call-sites.
 *
 * Requires "resolveJsonModule": true in tsconfig.json
 * (Next.js default tsconfig already sets this).
 */
import en from '@/messages/en.json';

type Messages = typeof en;
type Namespace = keyof Messages;
type Key<N extends Namespace> = keyof Messages[N] & string;

/**
 * Returns a typed t(key) function scoped to one namespace.
 * All values in en.json are flat string — no nested objects per namespace.
 */
export function getT<N extends Namespace>(namespace: N): (key: Key<N>) => string {
  const ns = en[namespace] as Record<string, string>;
  return (key) => ns[key] ?? key; // fallback: return key itself if missing
}
```

---

### Исправленные файлы

#### `src/app/globals.css`

```css
/* FIX: @import "tailwindcss" replaces v3's three-directive block.
   Tailwind v4 resolves content paths via CSS @source, not tailwind.config.js. */
@import 'tailwindcss';

/*
  Design tokens as CSS custom properties.
  These are consumed via var() throughout the codebase, NOT as Tailwind
  utility class names. If utility generation (bg-kc-gold, etc.) becomes
  needed in a later block, migrate the relevant tokens into @theme {}.
  See: https://tailwindcss.com/docs/theme (v4 @theme directive)
*/

:root {
  /* Background scale */
  --kc-bg: #0a0a0f;
  --kc-bg-card: #13131a;
  --kc-bg-elevated: #1c1c27;

  /* Borders */
  --kc-border: #2a2a3d;

  /* Brand gold */
  --kc-gold: #c9a84c;
  --kc-gold-light: #e2c97e;
  --kc-gold-muted: #7a6230;

  /* Typography */
  --kc-text: #f0ede8;
  --kc-text-muted: #8a8799;
  --kc-text-subtle: #52505e;

  /* Layout */
  --kc-header-h: 4rem; /* 64px — sync with sticky offset */
  --kc-max-w: 1280px;
  --kc-gutter: clamp(1rem, 4vw, 2.5rem);

  /* Shared */
  --kc-radius: 0.5rem;
  --kc-radius-lg: 1rem;
  --kc-transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

@layer base {
  * {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background-color: var(--kc-bg);
    color: var(--kc-text);
    min-height: 100dvh;
  }

  ::selection {
    background-color: var(--kc-gold-muted);
    color: var(--kc-text);
  }

  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: var(--kc-bg);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--kc-border);
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--kc-gold-muted);
  }
}

@layer utilities {
  .kc-container {
    width: 100%;
    max-width: var(--kc-max-w);
    margin-inline: auto;
    padding-inline: var(--kc-gutter);
  }

  .kc-gold-rule {
    border: none;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--kc-gold-muted) 30%,
      var(--kc-gold) 50%,
      var(--kc-gold-muted) 70%,
      transparent 100%
    );
  }
}
```

---

#### `src/components/layout/navigation.ts`

```typescript
/**
 * Role contract — source of truth: docs/SPEC.md §Roles
 * B04: resolved from Clerk JWT custom claims.
 *
 * FIX: Removed coach/member/programme/schedule which are not SPEC roles.
 *      Correct roles: guest | FREE | BUSINESS | ADMIN
 *      Correct header variants per role per SPEC:
 *        guest    → Directory, Verify Card  (+  Sign In | Join Now)
 *        FREE     → Directory, Dashboard    (+  My Account | Sign Out)
 *        BUSINESS → + Recommend a Client
 *        ADMIN    → + Admin panel
 */

// ─── Types ────────────────────────────────────────────────────

export type SessionRole = 'guest' | 'FREE' | 'BUSINESS' | 'ADMIN';

export interface NavItem {
  key: string; // key within 'nav' message namespace (en.json)
  fallback: string; // en label; B05: server component calls getT('nav')(key)
  href: string;
  roles: SessionRole[];
  exact?: boolean;
}

export interface AuthActionItem {
  key: string; // key within 'auth' message namespace (en.json)
  fallback: string;
  href: string;
}

// ─── Primary navigation ───────────────────────────────────────

export const PRIMARY_NAV: NavItem[] = [
  {
    key: 'directory',
    fallback: 'Directory',
    href: '/directory',
    roles: ['guest', 'FREE', 'BUSINESS', 'ADMIN'],
  },
  {
    // Shown to guests only — authenticated members have verified status
    key: 'verifyCard',
    fallback: 'Verify Card',
    href: '/verify-card',
    roles: ['guest'],
  },
  {
    key: 'dashboard',
    fallback: 'Dashboard',
    href: '/dashboard',
    roles: ['FREE', 'BUSINESS', 'ADMIN'],
  },
  {
    key: 'recommendClient',
    fallback: 'Recommend a Client',
    href: '/recommend',
    roles: ['BUSINESS', 'ADMIN'],
  },
  {
    key: 'adminPanel',
    fallback: 'Admin',
    href: '/admin',
    roles: ['ADMIN'],
  },
];

// ─── Auth CTA pairs ───────────────────────────────────────────

/** Rendered in the header for unauthenticated (guest) users */
export const GUEST_AUTH = {
  signIn: { key: 'signIn', fallback: 'Sign In', href: '/sign-in' },
  joinNow: { key: 'joinNow', fallback: 'Join Now', href: '/sign-up' },
} as const satisfies Record<string, AuthActionItem>;

/** Rendered in the header for all authenticated roles */
export const MEMBER_AUTH = {
  account: { key: 'account', fallback: 'My Account', href: '/account' },
  signOut: { key: 'signOut', fallback: 'Sign Out', href: '/sign-out' },
} as const satisfies Record<string, AuthActionItem>;

// ─── Helper ───────────────────────────────────────────────────

export function filterNavByRole(items: NavItem[], role: SessionRole): NavItem[] {
  return items.filter((item) => item.roles.includes(role));
}
```

---

#### `src/lib/auth/navigation-session.ts`

```typescript
/**
 * B02-safe navigation session adapter.
 *
 * CONTRACT: getNavigationSession() → NavigationSession (unchanged in B04+).
 * B04: replace the stub body with Clerk auth(); signature stays identical.
 *
 * FIX: SessionRole aligned with SPEC.md §Roles (guest|FREE|BUSINESS|ADMIN).
 *      Removed member/coach which do not exist in the product spec.
 */
import type { SessionRole } from '@/components/layout/navigation';

export interface NavigationSession {
  role: SessionRole;
  userId?: string;
  displayName?: string;
  avatarUrl?: string;
  isLoaded: boolean;
}

// ─── B04 migration target ──────────────────────────────────────────────
// TODO(B04): replace getNavigationSession body with:
//
//   import { auth, currentUser } from '@clerk/nextjs/server';
//
//   const { userId } = await auth();
//   if (!userId) return GUEST_SESSION;
//
//   const user = await currentUser();
//   const role = resolveClerkRole(user);   // maps Clerk metadata → FREE | BUSINESS | ADMIN
//   return {
//     role,
//     userId,
//     displayName: user.fullName ?? undefined,
//     avatarUrl:   user.imageUrl  ?? undefined,
//     isLoaded:    true,
//   };
// ──────────────────────────────────────────────────────────────────────

const GUEST_SESSION: NavigationSession = {
  role: 'guest',
  isLoaded: true,
};

export async function getNavigationSession(): Promise<NavigationSession> {
  // B02 stub — always guest until Clerk is wired in B04
  return GUEST_SESSION;
}

// Utility used by middleware (B04) and server guards (B06+)
export function isAtLeast(session: NavigationSession, minimum: SessionRole): boolean {
  const order: SessionRole[] = ['guest', 'FREE', 'BUSINESS', 'ADMIN'];
  return order.indexOf(session.role) >= order.indexOf(minimum);
}
```

---

#### `src/components/layout/site-header.tsx`

```tsx
/**
 * Server Component — reads session + translates aria labels server-side,
 * then passes typed props to HeaderClient (the interactive 'use client' layer).
 *
 * B05: swap  getT('a11y')  →  await getTranslations('a11y')
 */
import { getNavigationSession } from '@/lib/auth/navigation-session';
import { getT } from '@/lib/i18n/t-server';

import { HeaderClient } from './header-client';
import { GUEST_AUTH, MEMBER_AUTH, PRIMARY_NAV, filterNavByRole } from './navigation';

export async function SiteHeader() {
  const session = await getNavigationSession();
  const navItems = filterNavByRole(PRIMARY_NAV, session.role);
  const ta = getT('a11y'); // B05: await getTranslations('a11y')

  return (
    <HeaderClient
      navItems={navItems}
      session={session}
      guestAuth={GUEST_AUTH}
      memberAuth={MEMBER_AUTH}
      ariaLabels={{
        openMenu: ta('openMenu'),
        closeMenu: ta('closeMenu'),
        primaryNav: ta('primaryNav'),
        mobileNav: ta('mobileNav'),
      }}
    />
  );
}
```

---

#### `src/components/layout/header-client.tsx`

```tsx
'use client';

/**
 * FIX: auth action props renamed to guestAuth / memberAuth to match
 *      SPEC role model. signUp renamed to joinNow. coach/member removed.
 *      All aria strings come from server via ariaLabels prop (not hard-coded).
 *      Nav labels use item.fallback (sourced from navigation.ts / en.json).
 *      B05 migration: server component pre-translates item labels before passing.
 */
import { useState } from 'react';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { NavigationSession } from '@/lib/auth/navigation-session';
import { cn } from '@/lib/utils';

import type { NavItem } from './navigation';

interface AuthActionItem {
  key: string;
  fallback: string;
  href: string;
}

interface HeaderClientProps {
  navItems: NavItem[];
  session: NavigationSession;
  guestAuth: {
    signIn: AuthActionItem;
    joinNow: AuthActionItem;
  };
  memberAuth: {
    account: AuthActionItem;
    signOut: AuthActionItem;
  };
  /** Translated server-side; avoids need for next-intl client setup in B02 */
  ariaLabels: {
    openMenu: string;
    closeMenu: string;
    primaryNav: string;
    mobileNav: string;
  };
}

export function HeaderClient({
  navItems,
  session,
  guestAuth,
  memberAuth,
  ariaLabels,
}: HeaderClientProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const isAuth = session.role !== 'guest';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-[var(--kc-border)]',
        'bg-[var(--kc-bg-card)]/90 backdrop-blur-md',
        'h-[var(--kc-header-h)]',
      )}
    >
      <div className="kc-container flex h-full items-center justify-between">
        {/* ── Logo ─────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:kc-focus-ring"
          onClick={() => setOpen(false)}
        >
          <span className="text-sm font-bold tracking-[0.2em] text-[var(--kc-gold)] uppercase">
            Kylyvnyk
          </span>
          <span className="hidden sm:block text-sm font-light tracking-widest text-[var(--kc-text-muted)] uppercase">
            Club
          </span>
        </Link>

        {/* ── Desktop nav ───────────────────────────────────── */}
        <nav aria-label={ariaLabels.primaryNav} className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-[var(--kc-radius)]',
                'transition-colors duration-[var(--kc-transition)] focus-visible:kc-focus-ring',
                isActive(item.href, item.exact)
                  ? 'bg-[var(--kc-bg-elevated)] text-[var(--kc-gold)]'
                  : 'text-[var(--kc-text-muted)] hover:text-[var(--kc-text)] hover:bg-[var(--kc-bg-elevated)]',
              )}
            >
              {item.fallback}
              {/* B05: server pre-translates → passes as item.label */}
            </Link>
          ))}
        </nav>

        {/* ── Desktop auth ──────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          {isAuth ? (
            <>
              {session.displayName && (
                <span className="text-xs text-[var(--kc-text-muted)]">{session.displayName}</span>
              )}
              <Link
                href={memberAuth.account.href}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-[var(--kc-radius)]',
                  'text-[var(--kc-text-muted)] hover:text-[var(--kc-text)]',
                  'transition-colors duration-[var(--kc-transition)] focus-visible:kc-focus-ring',
                )}
              >
                {memberAuth.account.fallback}
              </Link>
              <Link
                href={memberAuth.signOut.href}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-[var(--kc-radius)]',
                  'text-[var(--kc-text-muted)] hover:text-[var(--kc-text)]',
                  'transition-colors duration-[var(--kc-transition)] focus-visible:kc-focus-ring',
                )}
              >
                {memberAuth.signOut.fallback}
              </Link>
            </>
          ) : (
            <>
              <Link
                href={guestAuth.signIn.href}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-[var(--kc-radius)]',
                  'text-[var(--kc-text-muted)] hover:text-[var(--kc-text)]',
                  'transition-colors duration-[var(--kc-transition)] focus-visible:kc-focus-ring',
                )}
              >
                {guestAuth.signIn.fallback}
              </Link>
              <Link
                href={guestAuth.joinNow.href}
                className={cn(
                  'px-4 py-2 text-sm font-semibold rounded-[var(--kc-radius)] uppercase tracking-wider',
                  'bg-[var(--kc-gold)] text-[var(--kc-bg)]',
                  'hover:bg-[var(--kc-gold-light)]',
                  'transition-colors duration-[var(--kc-transition)] focus-visible:kc-focus-ring',
                )}
              >
                {guestAuth.joinNow.fallback}
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile burger ─────────────────────────────────── */}
        <button
          aria-label={open ? ariaLabels.closeMenu : ariaLabels.openMenu}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'md:hidden p-2 rounded-[var(--kc-radius)]',
            'text-[var(--kc-text-muted)] hover:text-[var(--kc-text)]',
            'hover:bg-[var(--kc-bg-elevated)]',
            'transition-colors duration-[var(--kc-transition)] focus-visible:kc-focus-ring',
          )}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────── */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label={ariaLabels.mobileNav}
          className={cn(
            'md:hidden absolute inset-x-0 top-[var(--kc-header-h)] z-50',
            'bg-[var(--kc-bg-card)] border-b border-[var(--kc-border)] shadow-xl',
            'px-[var(--kc-gutter)] pt-4 pb-6 flex flex-col gap-1',
          )}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'px-3 py-2.5 text-sm font-medium rounded-[var(--kc-radius)]',
                'transition-colors duration-[var(--kc-transition)] focus-visible:kc-focus-ring',
                isActive(item.href, item.exact)
                  ? 'bg-[var(--kc-bg-elevated)] text-[var(--kc-gold)]'
                  : 'text-[var(--kc-text-muted)] hover:text-[var(--kc-text)] hover:bg-[var(--kc-bg-elevated)]',
              )}
            >
              {item.fallback}
            </Link>
          ))}

          <hr className="kc-gold-rule my-3" />

          {isAuth ? (
            <>
              <Link
                href={memberAuth.account.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm text-[var(--kc-text-muted)] rounded-[var(--kc-radius)] hover:bg-[var(--kc-bg-elevated)] focus-visible:kc-focus-ring"
              >
                {memberAuth.account.fallback}
              </Link>
              <Link
                href={memberAuth.signOut.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm text-[var(--kc-text-muted)] rounded-[var(--kc-radius)] hover:bg-[var(--kc-bg-elevated)] focus-visible:kc-focus-ring"
              >
                {memberAuth.signOut.fallback}
              </Link>
            </>
          ) : (
            <>
              <Link
                href={guestAuth.signIn.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm text-[var(--kc-text-muted)] rounded-[var(--kc-radius)] hover:bg-[var(--kc-bg-elevated)] focus-visible:kc-focus-ring"
              >
                {guestAuth.signIn.fallback}
              </Link>
              <Link
                href={guestAuth.joinNow.href}
                onClick={() => setOpen(false)}
                className="mt-1 px-4 py-2.5 text-sm font-semibold text-center rounded-[var(--kc-radius)] uppercase tracking-wider bg-[var(--kc-gold)] text-[var(--kc-bg)] hover:bg-[var(--kc-gold-light)] focus-visible:kc-focus-ring"
              >
                {guestAuth.joinNow.fallback}
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
```

---

#### `src/components/layout/site-footer.tsx`

```tsx
/**
 * FIX: Legal copy replaced.
 * - Previous: "Premium training environment" / "membership organisation" ← WRONG
 * - Correct:  "independent private membership platform" per docs/SPEC.md §Legal
 *
 * ⚠️  LEGAL NOTICE: The text in legalDisclaimer (src/messages/en.json §footer)
 *     MUST be verified word-for-word against docs/SPEC.md §Legal before any
 *     production release. Do not rephrase without explicit sign-off.
 *     The phrase "independent private membership platform" is mandatory.
 *
 * B05: swap getT('footer') / getT('a11y') → await getTranslations('footer') / ('a11y')
 */
import Link from 'next/link';

import { getT } from '@/lib/i18n/t-server';

// Keys map to en.json §footer — changing a key here requires updating en.json too
const FOOTER_LINKS = [
  { key: 'privacyPolicy' as const, href: '/legal/privacy' },
  { key: 'termsOfService' as const, href: '/legal/terms' },
  { key: 'cookiePolicy' as const, href: '/legal/cookies' },
  { key: 'contact' as const, href: '/contact' },
];

export function SiteFooter() {
  const tf = getT('footer'); // B05: await getTranslations('footer')
  const ta = getT('a11y'); // B05: await getTranslations('a11y')
  const year = new Date().getFullYear();

  return (
    <footer
      aria-label={ta('siteFooter')}
      className="mt-auto border-t border-[var(--kc-border)] bg-[var(--kc-bg-card)]"
    >
      <div className="kc-container py-10">
        <hr className="kc-gold-rule mb-8" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold tracking-widest text-[var(--kc-gold)] uppercase">
              {tf('brand')}
            </span>
            <p className="text-xs text-[var(--kc-text-subtle)] max-w-xs">{tf('tagline')}</p>
          </div>

          {/* Footer nav */}
          <nav aria-label={ta('footerNav')}>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-[var(--kc-text-muted)] transition-colors
                               hover:text-[var(--kc-gold-light)] focus-visible:kc-focus-ring"
                  >
                    {tf(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Legal copy — verify verbatim against docs/SPEC.md §Legal before shipping */}
        <div className="mt-8 space-y-1.5">
          <p className="text-xs text-[var(--kc-text-subtle)]">
            © {year} {tf('brand')}. {tf('allRightsReserved')}
          </p>
          <p className="text-xs text-[var(--kc-text-subtle)] max-w-2xl">{tf('legalDisclaimer')}</p>
        </div>
      </div>
    </footer>
  );
}
```

---

#### `src/app/layout.tsx`

```tsx
/**
 * FIX: lang="uk" → lang="en"
 * MVP locale is English only per AGENTS.md.
 * B05: next-intl middleware injects the correct lang attribute dynamically.
 */
import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';

import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Kylyvnyk Club',
    template: '%s — Kylyvnyk Club',
  },
  description: 'Independent private membership platform.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  robots: { index: false, follow: false }, // enable post-launch
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // B05: lang will be injected by next-intl's generateMetadata / middleware
  const SKIP_LABEL = 'Skip to main content'; // B05: t('a11y.skipToContent')

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]
                     focus:rounded focus:bg-[var(--kc-gold)] focus:px-4 focus:py-2
                     focus:text-sm focus:font-semibold focus:text-[var(--kc-bg)]"
        >
          {SKIP_LABEL}
        </a>
        {children}
      </body>
    </html>
  );
}
```

---

#### `src/app/page.tsx`

```tsx
/**
 * FIX: redirect('/uk') → redirect('/en')
 * MVP locale = en only. Phase 2 adds middleware-driven locale detection
 * for ru/uk per AGENTS.md §Locale.
 */
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Phase 2: remove this redirect; next-intl middleware handles locale detection
  redirect('/en');
}
```

---

#### `src/app/[locale]/layout.tsx`

```tsx
/**
 * FIX: SUPPORTED_LOCALES was ['uk','en'] → corrected to ['en'] only.
 * MVP is English-only per AGENTS.md. Phase 2 adds ru/uk.
 *
 * generateStaticParams is required by Next.js 14+ app router for dynamic
 * segments — without it the build warns about missing params at prerender.
 *
 * B05: wrap children with <NextIntlClientProvider> and pass locale + messages.
 */
import { AppShell } from '@/components/layout/app-shell';

// Phase 2: extend to ['en', 'ru', 'uk'] and add next-intl routing config
const SUPPORTED_LOCALES = ['en'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  // B05: pass locale to NextIntlClientProvider + setRequestLocale(locale)
  void locale;
  return <AppShell>{children}</AppShell>;
}
```

---

### Обновлённый чеклист B02

```
── Новые файлы ────────────────────────────────────────────────────
✅ src/messages/en.json                 единый источник всех строк
✅ src/lib/i18n/t-server.ts             stub → зеркалит getTranslations() API

── Исправленные файлы ────────────────────────────────────────────
✅ globals.css                          @import "tailwindcss" (v4)
✅ navigation.ts                        guest|FREE|BUSINESS|ADMIN; правильный nav
✅ navigation-session.ts                SessionRole выровнен со SPEC
✅ site-header.tsx                      использует getT для aria-labels
✅ header-client.tsx                    guestAuth/memberAuth props; без хардкода
✅ site-footer.tsx                      "independent private membership platform" + ⚠️ TODO verify SPEC
✅ app/layout.tsx                       lang="en"
✅ app/page.tsx                         redirect('/en')
✅ app/[locale]/layout.tsx              generateStaticParams → ['en'] only

── Без изменений (архитектурно верно) ───────────────────────────
✅ app-shell.tsx                        flex min-h-dvh структура
✅ page-wrapper.tsx                     kc-container + вертикальный ритм

── Маркеры для следующих блоков ────────────────────────────────
🔜 TODO(B04)  navigation-session.ts     заменить stub на Clerk auth()
🔜 TODO(B05)  t-server.ts              getT() → await getTranslations()
🔜 TODO(B05)  [locale]/layout.tsx      добавить NextIntlClientProvider
🔜 TODO(legal) site-footer.tsx         сверить legalDisclaimer с docs/SPEC.md §Legal
```
