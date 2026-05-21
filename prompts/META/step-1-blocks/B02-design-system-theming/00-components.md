## Анализ плана B02

Архитектура Codex **звучит правильно**, но перед тем как дать добро — вот мой аудит + сразу весь код для всех файлов.

---

### ✅ Что хорошо в плане

| Решение                                    | Почему правильно                                    |
| ------------------------------------------ | --------------------------------------------------- |
| `SessionRole` адаптер вместо прямого Clerk | Чистый контракт — B04 меняет только тело функции    |
| `async getNavigationSession()` на сервере  | Готово к `auth()` от Clerk без рефакторинга         |
| `[locale]/layout.tsx` стаб                 | next-intl подключается в B03/B05 без ломки роутинга |
| Убрать `page.module.css`                   | Правильно — ломает Tailwind-first подход            |

### ⚠️ Что Codex не уточнил

1. **Header должен быть гибридным** — Server Component для данных сессии, Client Component для мобильного меню (иначе `useState` сломает RSC).
2. **`[locale]` папка без `generateStaticParams`** — Next.js 14+ будет ругаться при билде. Нужен минимальный стаб.
3. **CSS переменные** — нужно договориться о палитре ДО написания компонентов.

---

### Полная реализация B02

#### `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── Brand tokens ─────────────────────────────────────────── */
@layer base {
  :root {
    --kc-bg: #0a0a0f;
    --kc-bg-card: #13131a;
    --kc-bg-elevated: #1c1c27;
    --kc-border: #2a2a3d;

    --kc-gold: #c9a84c;
    --kc-gold-light: #e2c97e;
    --kc-gold-muted: #7a6230;

    --kc-text: #f0ede8;
    --kc-text-muted: #8a8799;
    --kc-text-subtle: #52505e;

    --kc-header-h: 4rem; /* 64px — sync with sticky offset */
    --kc-footer-h: auto;
    --kc-max-w: 1280px;
    --kc-gutter: clamp(1rem, 4vw, 2.5rem);

    --kc-radius: 0.5rem;
    --kc-radius-lg: 1rem;

    --kc-transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }
}

/* ─── Base resets ───────────────────────────────────────────── */
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

  /* scrollbar */
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

/* ─── Utility classes used across the shell ─────────────────── */
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

  .kc-focus-ring {
    outline: 2px solid var(--kc-gold);
    outline-offset: 2px;
    border-radius: var(--kc-radius);
  }
}
```

---

#### `src/components/layout/navigation.ts`

```typescript
// ─── Role contract (B04 will hydrate from Clerk JWT claims) ──

export type SessionRole = 'guest' | 'member' | 'coach' | 'admin';

export interface NavItem {
  key: string; // stable i18n key (B05 will map to next-intl)
  label: string; // fallback English label
  href: string;
  roles: SessionRole[]; // which roles see this item
  exact?: boolean; // highlight only on exact match
}

// ─── Primary navigation ──────────────────────────────────────

export const PRIMARY_NAV: NavItem[] = [
  {
    key: 'home',
    label: 'Home',
    href: '/',
    roles: ['guest', 'member', 'coach', 'admin'],
    exact: true,
  },
  {
    key: 'programme',
    label: 'Programme',
    href: '/programme',
    roles: ['guest', 'member', 'coach', 'admin'],
  },
  {
    key: 'schedule',
    label: 'Schedule',
    href: '/schedule',
    roles: ['member', 'coach', 'admin'],
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    roles: ['member', 'coach', 'admin'],
  },
  {
    key: 'admin',
    label: 'Admin',
    href: '/admin',
    roles: ['admin'],
  },
];

// ─── Auth action config ──────────────────────────────────────

export const AUTH_ACTIONS = {
  signIn: { label: 'Sign In', href: '/sign-in' },
  signUp: { label: 'Join the Club', href: '/sign-up' },
  portal: { label: 'My Account', href: '/account' },
  signOut: { label: 'Sign Out', href: '/sign-out' },
} as const;

// ─── Helper ──────────────────────────────────────────────────

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
 * CONTRACT: returns a typed NavigationSession.
 * B04 implementation: replace the body of getNavigationSession()
 * with Clerk's `auth()` + `currentUser()` — the signature stays identical.
 *
 * @see src/components/layout/navigation.ts for SessionRole
 */
import type { SessionRole } from '@/components/layout/navigation';

export interface NavigationSession {
  role: SessionRole;
  userId?: string;
  displayName?: string;
  avatarUrl?: string;
  isLoaded: boolean; // false = auth provider still hydrating (SSR edge case)
}

// ─── B04 TODO marker so grep finds it easily ─────────────────
// TODO(B04): replace stub with →
//   import { auth, currentUser } from '@clerk/nextjs/server';
//   const { userId } = await auth();
//   if (!userId) return GUEST_SESSION;
//   const user = await currentUser();
//   return { role: resolveClerkRole(user), userId, ... };

const GUEST_SESSION: NavigationSession = {
  role: 'guest',
  isLoaded: true,
};

export async function getNavigationSession(): Promise<NavigationSession> {
  // B02 stub — always guest until Clerk lands in B04
  return GUEST_SESSION;
}

// ─── Role resolution helper (used by middleware too in B04) ──

export function isAtLeast(session: NavigationSession, minimum: SessionRole): boolean {
  const order: SessionRole[] = ['guest', 'member', 'coach', 'admin'];
  return order.indexOf(session.role) >= order.indexOf(minimum);
}
```

---

#### `src/components/layout/page-wrapper.tsx`

```tsx
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  /** Remove horizontal padding — useful for full-bleed heroes */
  flush?: boolean;
  /** Remove top padding (e.g. page already has a hero that handles spacing) */
  noTopPad?: boolean;
}

/**
 * Constrains content to --kc-max-w with consistent gutter + vertical rhythm.
 * Wrap every page's inner content in this — not the shell itself.
 */
export function PageWrapper({
  children,
  className,
  flush = false,
  noTopPad = false,
}: PageWrapperProps) {
  return (
    <div
      className={cn(
        'kc-container',
        !noTopPad && 'pt-10 md:pt-16',
        'pb-16 md:pb-24',
        flush && 'px-0', // override gutter for full-bleed sections
        className,
      )}
    >
      {children}
    </div>
  );
}
```

---

#### `src/components/layout/site-footer.tsx`

```tsx
import Link from 'next/link';

const CURRENT_YEAR = new Date().getFullYear();

const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Cookie Policy', href: '/legal/cookies' },
  { label: 'Contact', href: '/contact' },
] as const;

/**
 * Legal footer — wording sourced from docs/SPEC.md §Legal.
 * No Stripe links in B02 (payment UI is B06+).
 */
export function SiteFooter() {
  return (
    <footer
      aria-label="Site footer"
      className="mt-auto border-t border-[var(--kc-border)] bg-[var(--kc-bg-card)]"
    >
      <div className="kc-container py-10">
        {/* Gold rule */}
        <hr className="kc-gold-rule mb-8" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold tracking-widest text-[var(--kc-gold)] uppercase">
              Kylyvnyk Club
            </span>
            <p className="text-xs text-[var(--kc-text-subtle)] max-w-xs">
              Premium training environment. Results-driven community.
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-[var(--kc-text-muted)] transition-colors
                               duration-[var(--kc-transition)]
                               hover:text-[var(--kc-gold-light)]
                               focus-visible:kc-focus-ring"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Legal copy */}
        <div className="mt-8 space-y-1">
          <p className="text-xs text-[var(--kc-text-subtle)]">
            © {CURRENT_YEAR} Kylyvnyk Club. All rights reserved. Kylyvnyk Club is a private
            membership organisation.
          </p>
          <p className="text-xs text-[var(--kc-text-subtle)]">
            Membership is subject to our{' '}
            <Link
              href="/legal/terms"
              className="underline underline-offset-2 hover:text-[var(--kc-gold-light)]"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/legal/privacy"
              className="underline underline-offset-2 hover:text-[var(--kc-gold-light)]"
            >
              Privacy Policy
            </Link>
            . By accessing this platform you agree to be bound by these terms.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

---

#### `src/components/layout/site-header.tsx`

> **Split into Server + Client** — server reads session, client handles mobile toggle.

```tsx
// site-header.tsx  →  Server Component (reads session)
import { getNavigationSession } from '@/lib/auth/navigation-session';

import { HeaderClient } from './header-client';
import { AUTH_ACTIONS, PRIMARY_NAV, filterNavByRole } from './navigation';

export async function SiteHeader() {
  const session = await getNavigationSession();
  const navItems = filterNavByRole(PRIMARY_NAV, session.role);

  return <HeaderClient navItems={navItems} session={session} authActions={AUTH_ACTIONS} />;
}
```

---

#### `src/components/layout/header-client.tsx`

```tsx
'use client';

import { useState } from 'react';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { NavigationSession } from '@/lib/auth/navigation-session';
// adjust if using different icon lib
import { cn } from '@/lib/utils';

import type { NavItem } from './navigation';

interface HeaderClientProps {
  navItems: NavItem[];
  session: NavigationSession;
  authActions: {
    signIn: { label: string; href: string };
    signUp: { label: string; href: string };
    portal: { label: string; href: string };
    signOut: { label: string; href: string };
  };
}

export function HeaderClient({ navItems, session, authActions }: HeaderClientProps) {
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
        {/* ── Logo ──────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:kc-focus-ring"
          onClick={() => setOpen(false)}
        >
          <span className="text-sm font-bold tracking-[0.2em] text-[var(--kc-gold)] uppercase">
            Kylyvnyk
          </span>
          <span className="hidden text-sm font-light tracking-widest text-[var(--kc-text-muted)] sm:block uppercase">
            Club
          </span>
        </Link>

        {/* ── Desktop nav ───────────────────────────────────── */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-[var(--kc-radius)]',
                'transition-colors duration-[var(--kc-transition)]',
                'focus-visible:kc-focus-ring',
                isActive(item.href, item.exact)
                  ? 'bg-[var(--kc-bg-elevated)] text-[var(--kc-gold)]'
                  : 'text-[var(--kc-text-muted)] hover:text-[var(--kc-text)] hover:bg-[var(--kc-bg-elevated)]',
              )}
            >
              {item.label}
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
                href={authActions.signOut.href}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-[var(--kc-radius)]',
                  'text-[var(--kc-text-muted)] hover:text-[var(--kc-text)]',
                  'transition-colors duration-[var(--kc-transition)]',
                  'focus-visible:kc-focus-ring',
                )}
              >
                {authActions.signOut.label}
              </Link>
            </>
          ) : (
            <>
              <Link
                href={authActions.signIn.href}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-[var(--kc-radius)]',
                  'text-[var(--kc-text-muted)] hover:text-[var(--kc-text)]',
                  'transition-colors duration-[var(--kc-transition)]',
                  'focus-visible:kc-focus-ring',
                )}
              >
                {authActions.signIn.label}
              </Link>
              <Link
                href={authActions.signUp.href}
                className={cn(
                  'px-4 py-2 text-sm font-semibold rounded-[var(--kc-radius)]',
                  'bg-[var(--kc-gold)] text-[var(--kc-bg)] uppercase tracking-wider',
                  'hover:bg-[var(--kc-gold-light)]',
                  'transition-colors duration-[var(--kc-transition)]',
                  'focus-visible:kc-focus-ring',
                )}
              >
                {authActions.signUp.label}
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile burger ─────────────────────────────────── */}
        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'md:hidden p-2 rounded-[var(--kc-radius)]',
            'text-[var(--kc-text-muted)] hover:text-[var(--kc-text)]',
            'hover:bg-[var(--kc-bg-elevated)]',
            'transition-colors duration-[var(--kc-transition)]',
            'focus-visible:kc-focus-ring',
          )}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className={cn(
            'md:hidden absolute inset-x-0 top-[var(--kc-header-h)]',
            'bg-[var(--kc-bg-card)] border-b border-[var(--kc-border)]',
            'px-[var(--kc-gutter)] pb-6 pt-4 flex flex-col gap-1',
            'z-50 shadow-xl',
          )}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'px-3 py-2.5 text-sm font-medium rounded-[var(--kc-radius)]',
                'transition-colors duration-[var(--kc-transition)]',
                'focus-visible:kc-focus-ring',
                isActive(item.href, item.exact)
                  ? 'bg-[var(--kc-bg-elevated)] text-[var(--kc-gold)]'
                  : 'text-[var(--kc-text-muted)] hover:text-[var(--kc-text)] hover:bg-[var(--kc-bg-elevated)]',
              )}
            >
              {item.label}
            </Link>
          ))}

          <hr className="kc-gold-rule my-3" />

          {isAuth ? (
            <Link
              href={authActions.signOut.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm text-[var(--kc-text-muted)] rounded-[var(--kc-radius)] hover:bg-[var(--kc-bg-elevated)] focus-visible:kc-focus-ring"
            >
              {authActions.signOut.label}
            </Link>
          ) : (
            <>
              <Link
                href={authActions.signIn.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm text-[var(--kc-text-muted)] rounded-[var(--kc-radius)] hover:bg-[var(--kc-bg-elevated)] focus-visible:kc-focus-ring"
              >
                {authActions.signIn.label}
              </Link>
              <Link
                href={authActions.signUp.href}
                onClick={() => setOpen(false)}
                className="mt-1 px-4 py-2.5 text-sm font-semibold text-center rounded-[var(--kc-radius)] bg-[var(--kc-gold)] text-[var(--kc-bg)] uppercase tracking-wider hover:bg-[var(--kc-gold-light)] focus-visible:kc-focus-ring"
              >
                {authActions.signUp.label}
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

#### `src/components/layout/app-shell.tsx`

```tsx
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Root shell: sticky header → scrollable main → footer.
 * Server Component — SiteHeader fetches its own session internally.
 */
export async function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main-content" className="flex flex-1 flex-col" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
```

---

#### `src/app/layout.tsx`

```tsx
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
  description: 'Premium training environment and results-driven community.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  robots: { index: false, follow: false }, // enable in prod after launch
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="uk" // B05: next-intl will control this dynamically via [locale]
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning // safe: dark-only app, no theme flash risk
    >
      <body className="font-sans antialiased">
        {/* Skip link for a11y */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]
                     focus:rounded focus:bg-[var(--kc-gold)] focus:px-4 focus:py-2
                     focus:text-sm focus:font-semibold focus:text-[var(--kc-bg)]"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
```

---

#### `src/app/[locale]/layout.tsx`

```tsx
/**
 * B02 locale layout stub.
 *
 * B05 TODO: wrap with <NextIntlClientProvider> and call
 *   getMessages({ locale }) here, then pass to the provider.
 *
 * generateStaticParams is required by Next.js 14+ when using
 * a dynamic segment in the app directory — without it the
 * build will warn about missing params at prerender time.
 */
import { AppShell } from '@/components/layout/app-shell';

// B05: derive from next-intl routing config
const SUPPORTED_LOCALES = ['uk', 'en'] as const;
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
  // locale is available here for B05 (NextIntlClientProvider, html lang, etc.)
  void locale;

  return <AppShell>{children}</AppShell>;
}
```

---

#### `src/app/page.tsx`

```tsx
/**
 * Root page — redirects to default locale route.
 * When next-intl lands in B05 this becomes middleware-driven.
 */
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/uk'); // default locale; B05: read from next-intl config
}
```

> 💡 **Если роутинг без `[locale]` пока не нужен**, замените `redirect` на JSX с `AppShell` напрямую — и удали `[locale]/layout.tsx`. Зависит от того, насколько срочно UI нужен ДО B05.

---

### Что удалить

```bash
# Больше не нужен — стили перенесены в globals.css + Tailwind утилиты
rm src/app/page.module.css
```

### Чеклист перед коммитом B02

```
✅ globals.css — токены + kc-container + kc-gold-rule
✅ navigation.ts — SessionRole + PRIMARY_NAV + filterNavByRole
✅ navigation-session.ts — getNavigationSession() stub + TODO(B04) маркер
✅ page-wrapper.tsx — контейнер страниц
✅ site-footer.tsx — legal copy без Stripe
✅ site-header.tsx — Server Component (чтение сессии)
✅ header-client.tsx — 'use client' (мобильное меню / active links)
✅ app-shell.tsx — компоновщик
✅ src/app/layout.tsx — html/body/шрифты
✅ src/app/[locale]/layout.tsx — стаб с generateStaticParams
✅ src/app/page.tsx — redirect на /uk
🗑  src/app/page.module.css — удалить
```

**B04 Clerk интеграция**: только меняешь тело `getNavigationSession()` — всё остальное не трогаешь. Контракт держит.
