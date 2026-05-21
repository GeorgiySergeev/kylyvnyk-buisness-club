# B02 — Design System & Layout Playbook

Перед стартом: убедитесь что `pnpm lint && pnpm typecheck && pnpm build` зелёный после B01. Если нет — сначала чиним B01.

---

## Что строим в B02

```
B02.01  Зависимости + next-intl config
B02.02  Root layout + [locale] layout + шрифты
B02.03  Middleware (Clerk + next-intl вместе)
B02.04  Container + PageWrapper + Footer
B02.05  Header (auth-aware)
B02.06  UI-атомы (StatusBadge, GoldDivider, EmptyState, Spinner, ErrorMessage)
B02.07  Home page placeholder — финальная проверка что всё рендерится
```

На выходе: открываете `localhost:3000` → видите тёмную страницу с Header'ом, Footer'ом, и золотыми акцентами. Все 8 страниц MVP будут жить внутри этого shell'а.

---

## Шаг B02.01 — Зависимости (руками, не через агента)

Это единственный шаг, где команды запускаете **сами** — `pnpm add *` в denylist'е агента по правильным причинам.

```bash
# новая ветка
git checkout -b feat/b02-design-system

# ставим зависимости с точными версиями
pnpm add next-intl@^3 @clerk/nextjs@^6
pnpm add @upstash/ratelimit @upstash/redis
pnpm add @t3-oss/env-nextjs zod

# dev-зависимости
pnpm add -D @types/node
```

Проверка:

```bash
# убедиться что всё поставилось
cat package.json | grep -E "next-intl|clerk|upstash|t3-oss"
# должно показать 4 строки с версиями

pnpm typecheck
# → 0 errors (пока нет новых файлов — должно быть чисто)
```

Коммит:

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat(b02): add next-intl, clerk, upstash, zod env deps"
```

---

## Шаг B02.02 — next-intl config + env loader

Вставьте в Cursor Agent:

```
Read /docs/DESIGN.md and /docs/STACK-DECISION.md ADR-006 (i18n).

Create the following files. Show me ALL diffs before applying anything.

1. src/i18n/config.ts
   - defineRouting from next-intl/routing
   - locales: ['en'] only (MVP)
   - defaultLocale: 'en'
   - localePrefix: 'always'

2. src/i18n/request.ts
   - getRequestConfig from next-intl/server
   - loads messages from messages/[locale]/*.json
   - returns { messages } merged from all namespace files

3. messages/en/common.json
   - keys: { "site": { "name": "KCLUB", "tagline": "Private Business Club" } }
   - keys: { "nav": { "directory": "Directory", "verifyCard": "Verify Card",
             "signIn": "Sign In", "joinNow": "Join Now", "dashboard": "Dashboard",
             "recommend": "Recommend a Client", "admin": "Admin", "signOut": "Sign Out" } }
   - keys: { "errors": { "notFound": "Page not found", "unauthorized": "Access denied",
             "internal": "Something went wrong" } }

4. messages/en/legal.json
   - keys: { "footer": {
       "disclaimer": "KCLUB is a private membership club. Not an MLM, investment, or financial product.",
       "terms": "Terms of Service",
       "privacy": "Privacy Policy",
       "copyright": "© 2026 KCLUB. All rights reserved."
     } }

5. src/lib/env.ts
   - Use @t3-oss/env-nextjs createEnv()
   - server schema: DATABASE_URL, DATABASE_URL_DIRECT, CLERK_SECRET_KEY,
     CLERK_WEBHOOK_SECRET, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN,
     TURNSTILE_SECRET_KEY, NODE_ENV
   - client schema: NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
     NEXT_PUBLIC_TURNSTILE_SITE_KEY
   - runtimeEnv: map each to process.env.VAR_NAME
   - skipValidation: !!process.env.SKIP_ENV_VALIDATION

Files to create:
- src/i18n/config.ts (create)
- src/i18n/request.ts (create)
- messages/en/common.json (create)
- messages/en/legal.json (create)
- src/lib/env.ts (modify — currently minimal placeholder)

Show me the diffs. Do not touch any other files.
```

**Что проверять в diff:**

`src/i18n/config.ts`:

```ts
// ✅ должно быть
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

// ❌ не должно быть
locales: ['en', 'ru', 'uk']; // Phase-2, не сейчас
localePrefix: 'as-needed'; // мы хотим /en/ всегда
```

`src/lib/env.ts`:

```ts
// ✅ должно быть — Zod validation с fail-fast
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    // ...
  },
  // ...
});

// ❌ не должно быть
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  // (no validation)
};
```

Если `env.ts` без zod — скажите:

```
env.ts must use @t3-oss/env-nextjs createEnv with zod schemas.
It must fail at startup if required vars are missing, printing which vars are absent.
Rewrite using the t3-oss pattern.
```

```bash
pnpm typecheck
# → 0 errors

git add src/i18n/ messages/ src/lib/env.ts
git commit -m "feat(b02): next-intl config, message files, typed env loader"
```

---

## Шаг B02.03 — Root layout + `[locale]` layout + шрифты

Вставьте в Cursor Agent:

```
Read /docs/DESIGN.md §3 (Typography) and §2.3 (globals.css @theme block).

We need to restructure the Next.js App Router for locale-based routing.
Current state: src/app/layout.tsx and src/app/page.tsx exist from B01.

Required structure after this step:
src/app/
  layout.tsx              ← root layout (html, body, providers)
  [locale]/
    layout.tsx            ← locale layout (i18n provider, main shell)
    page.tsx              ← home page placeholder

Files to create/modify:

1. src/app/layout.tsx (modify)
   - <html lang={undefined}> (lang set per-locale in children)
   - Load Inter and Playfair_Display from next/font/google
   - Inter: subsets ['latin', 'cyrillic'], variable '--font-sans'
   - Playfair_Display: subsets ['latin', 'cyrillic'], variable '--font-display'
   - Apply both font variables to <body>
   - body className: use NOT-hardcoded text, just font variables + antialiased
   - NO Clerk provider here — goes in [locale]/layout.tsx
   - NO next-intl provider here

2. src/app/[locale]/layout.tsx (create)
   - Accept params: { locale: string, children: React.ReactNode }
   - Use NextIntlClientProvider from next-intl
   - Load messages using getMessages() from next-intl/server
   - Use ClerkProvider from @clerk/nextjs with appearance from
     src/lib/auth/clerk-appearance.ts
   - Wrap: ClerkProvider → NextIntlClientProvider → {children}
   - Include the skip-to-content link from DESIGN.md §11.2

3. src/lib/auth/clerk-appearance.ts (create)
   - Export clerkAppearance object from DESIGN.md §9.3
   - Typed as Parameters<typeof ClerkProvider>[0]['appearance']

4. src/app/[locale]/page.tsx (create)
   - Simple placeholder: just <main id="main-content"><p>KCLUB Home</p></main>
   - We'll fill this in B08

5. src/app/globals.css (modify)
   - Replace everything with the full @theme block from DESIGN.md §2.3
   - Include base body styles, :focus-visible ring, scrollbar styles

Show me all diffs. Do not create middleware yet — that's the next step.
```

**Что проверять:**

`src/app/layout.tsx` — должен быть чистым, без бизнес-логики:

```tsx
// ✅
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>{children}</body>
    </html>
  );
}

// ❌ не должно быть lang="en" — это будет в [locale]/layout
// ❌ не должно быть ClerkProvider здесь
```

`src/app/[locale]/layout.tsx`:

```tsx
// ✅ правильный порядок провайдеров
<ClerkProvider appearance={clerkAppearance}>
  <NextIntlClientProvider messages={messages}>
    <a href="#main-content" className="sr-only focus:not-sr-only ...">
      Skip to content
    </a>
    {children}
  </NextIntlClientProvider>
</ClerkProvider>

// ❌ не должно быть html/body тегов здесь
// ❌ locale не должен быть захардкожен
```

`src/app/globals.css` — проверьте первые строки:

```css
/* ✅ */
@import 'tailwindcss';

@theme {
  --color-bg: #0a0a0b;
  /* ... всё из DESIGN.md §2.3 */
}

/* ❌ не должно быть */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

После применения:

```bash
pnpm dev
# открыть localhost:3000
# должен редиректить на localhost:3000/en
# страница тёмная (#0a0a0b фон)
# в dev tools: body имеет --font-sans и --font-display CSS переменные

pnpm typecheck
# → 0 errors
```

Если редиректа на `/en` нет — middleware ещё не написан (следующий шаг, это нормально). Пока `localhost:3000/en` должен работать напрямую.

```bash
git add src/app/ src/lib/auth/
git commit -m "feat(b02): root layout, [locale] layout, fonts, Clerk+i18n providers, globals.css tokens"
```

---

## Шаг B02.04 — Middleware (Clerk + next-intl)

Вставьте в Cursor Agent:

```
Read /docs/STACK-DECISION.md ADR-004 (Clerk) and ADR-006 (i18n).
Read /prompts/META/PATCHES/Patch-01-clerk-v6-async-auth.md.

Create src/middleware.ts that combines Clerk and next-intl middleware.

Requirements:
- Clerk v6: use clerkMiddleware and createRouteMatcher from @clerk/nextjs/server
- next-intl: use createMiddleware from 'next-intl/middleware'
- Protected routes (redirect to sign-in if not authenticated):
  /:locale/m/:path*      ← member area
  /:locale/b/:path*      ← business area
  /:locale/admin/:path*  ← admin panel
- Public routes (accessible without auth):
  /:locale              ← home
  /:locale/directory/:path*
  /:locale/verify-card/:path*
  /:locale/sign-in/:path*
  /:locale/sign-up/:path*
  /api/clerk/:path*
  /api/stripe/:path*   ← webhook, even though Stripe not in MVP yet
- Middleware chain:
  1. If protected route and not authed → Clerk redirects to sign-in
  2. next-intl handles locale detection and routing
- The matcher must exclude _next, static files, api routes that don't need auth
- IMPORTANT: auth() is async in Clerk v6 — use await auth.protect() not auth().protect()

File to create:
- src/middleware.ts (create)

Show me the diff.
```

**Что проверять:**

```ts
// ✅ правильный Clerk v6 + next-intl паттерн
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/config';

const intlMiddleware = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  '/:locale/m(.*)',
  '/:locale/b(.*)',
  '/:locale/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); // ← async, await обязателен
  }
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

// ❌ не должно быть
auth().protect(); // без await — сломается
const { protect } = auth(); // синхронный вызов
```

После применения:

```bash
pnpm dev

# тест 1: localhost:3000 → должен перенаправить на localhost:3000/en
# тест 2: localhost:3000/en/m/dashboard → должен перенаправить на /en/sign-in
# тест 3: localhost:3000/en/directory → должен открыться (public)

pnpm typecheck
# → 0 errors
```

Если тест 2 не работает (не редиректит) — проверьте matcher. Частая ошибка: `matcher` не включает `/:locale/m(.*)`:

```
The middleware is not protecting /en/m/dashboard.
Check the matcher config — it must include locale-prefixed paths.
The isProtectedRoute pattern /:locale/m(.*) should match /en/m/dashboard.
Show me what createRouteMatcher receives and fix it.
```

```bash
git add src/middleware.ts
git commit -m "feat(b02): combined Clerk v6 + next-intl middleware with route protection"
```

---

## Шаг B02.05 — Container + PageWrapper + Footer

Вставьте в Cursor Agent:

```
Read /docs/DESIGN.md §4 (Spacing & Layout) and §9 (page specs).

Create layout components. Show me all diffs before applying.

1. src/components/layout/Container.tsx
   - Props: children, className?, as? (default 'div')
   - Styles: mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8
   - Use cn() utility for className merging (from src/lib/utils.ts)

2. src/components/layout/PageWrapper.tsx
   - Props: children, className?
   - Wraps content in <main id="main-content"> with Container
   - Adds py-8 md:py-12 vertical padding
   - This is what page files use as their outermost wrapper

3. src/components/layout/Footer.tsx
   - Server Component (no 'use client')
   - Use getTranslations('legal.footer') for copy
   - Layout:
     Left: "KCLUB" wordmark (font-display text-accent) + disclaimer text (text-caption text-fg-muted)
     Right: Terms + Privacy links
     Bottom row: copyright text centered
   - Full width, bg-surface, border-t border-border, py-8
   - Container inside for max-width
   - All legal copy from i18n messages, NOT hardcoded

4. src/lib/utils.ts (modify — add cn if not already there)
   - import { clsx } from 'clsx'
   - import { twMerge } from 'tailwind-merge'
   - export function cn(...inputs) { return twMerge(clsx(inputs)) }
   - Note: clsx and tailwind-merge are shadcn/ui dependencies, already installed

Files:
- src/components/layout/Container.tsx (create)
- src/components/layout/PageWrapper.tsx (create)
- src/components/layout/Footer.tsx (create)
- src/lib/utils.ts (modify — confirm cn() is there)

Do NOT create the Header yet. That's the next step.
Show me diffs.
```

**Что проверять:**

`Footer.tsx` — критично: **никакого хардкода**:

```tsx
// ✅
const t = await getTranslations("legal.footer");
<p className="text-caption text-fg-muted">{t("disclaimer")}</p>

// ❌
<p className="text-caption text-fg-muted">
  KCLUB is a private membership club. Not an MLM...
</p>
// (нарушает i18n правило)
```

Также в Footer — проверьте что нет слова "affiliate", "MLM", "investment" даже в комментариях:

```bash
grep -i "mlm\|affiliate\|investment\|referral" src/components/layout/Footer.tsx
# должно вернуть ПУСТО
```

Обновите `[locale]/layout.tsx` чтобы включить Footer:

```
Now update src/app/[locale]/layout.tsx to include the Footer component.
The layout structure should be:
<ClerkProvider>
  <NextIntlClientProvider>
    <skip-link />
    {children}        ← pages render here (they include their own PageWrapper)
    <Footer />
  </NextIntlClientProvider>
</ClerkProvider>

The <Header /> will be added in the next step.
Show me only the diff for layout.tsx.
```

```bash
pnpm dev
# открыть localhost:3000/en
# внизу страницы должен быть footer с текстом из messages/en/legal.json
# фон footer: bg-surface (чуть светлее страницы)

pnpm typecheck
# → 0 errors

git add src/components/layout/ src/lib/utils.ts src/app/
git commit -m "feat(b02): Container, PageWrapper, Footer components + layout wiring"
```

---

## Шаг B02.06 — Header (auth-aware)

Это самый сложный компонент в B02. Header меняется в зависимости от роли. Делаем в три подшага.

### Подшаг 1 — Серверная логика

Вставьте в Cursor Agent:

```
Read /docs/DESIGN.md §9.1 and §9.2 (header nav specs per auth state).
Read /prompts/META/PATCHES/Patch-01-clerk-v6-async-auth.md.

Create the server-side auth resolver for the header.

File: src/features/auth/lib/get-header-user.ts
- Server only (import "server-only")
- Use await auth() from @clerk/nextjs/server
- Query our DB: db.query.users.findFirst where clerkUserId = userId
- Return typed object:
  | { status: 'unauthenticated' }
  | { status: 'authenticated', role: 'FREE' | 'BUSINESS' | 'ADMIN',
      displayName: string | null, avatarUrl: string | null }
- If Clerk has userId but no DB row → return 'unauthenticated'
  (user not fully provisioned yet — this is safe)
- NO throwing, always returns a typed result

File: src/features/auth/lib/get-header-user.ts (create)

Show me the diff.
```

**Что проверять:**

```ts
// ✅
import { auth } from '@clerk/nextjs/server';
import 'server-only';

export async function getHeaderUser() {
  const { userId } = await auth(); // ← await обязателен
  if (!userId) return { status: 'unauthenticated' } as const;
  // ...
}

// ❌
const { userId } = auth(); // без await
```

### Подшаг 2 — Клиентская часть (мобильное меню)

```
Create the client-side mobile menu component.

File: src/components/layout/MobileMenu.tsx
"use client"

Props:
- navItems: Array<{ label: string; href: string; highlight?: boolean }>
- isOpen: boolean
- onClose: () => void

Behavior:
- Slide-in drawer from the right
- Overlay behind it (bg-bg/80 backdrop-blur-sm)
- Close on overlay click or Escape key
- Each nav item: full-width link, py-4, border-b border-border
- Highlighted item (recommend client): text-accent font-semibold
- Close button (X icon from lucide-react) top-right
- Trap focus while open
- aria-modal, aria-label="Navigation menu"

File: src/components/layout/MobileMenu.tsx (create)
Show me the diff.
```

### Подшаг 3 — Основной Header

```
Create the main Header component.

File: src/components/layout/Header.tsx
- Server Component (async, no 'use client')
- Calls getHeaderUser() to know auth state
- Use getTranslations('common.nav') for all labels
- Structure:
  <header> bg-surface border-b border-border sticky top-0 z-50 backdrop-blur-md
    <Container>
      <nav> flex items-center justify-between h-16
        LEFT:  Logo "KCLUB" — font-display text-xl text-accent, links to /en
        CENTER (desktop only, hidden on mobile): nav links
        RIGHT: auth buttons or user menu + mobile hamburger

Nav links by auth state (from DESIGN.md §9.1, §9.2):

Unauthenticated:
  - Directory → /en/directory
  - Verify Card → /en/verify-card
  - [Sign In button, variant=outline, size=sm]
  - [Join Now button, variant=default, size=sm] → /en/sign-up

FREE member:
  - Directory → /en/directory
  - Dashboard → /en/m/dashboard
  - [Avatar + dropdown: Dashboard, Sign Out via Clerk SignOutButton]

BUSINESS member:
  - Directory → /en/directory
  - Dashboard → /en/m/dashboard
  - Recommend a Client → /en/m/introduce  (text-accent, star icon ✦)
  - [Avatar + dropdown: Dashboard, My Business, Recommend, Sign Out]

ADMIN:
  - Same as BUSINESS +
  - Admin → /en/admin (in dropdown, with shield icon)

Mobile (all states):
  - Show hamburger icon (Menu from lucide-react)
  - Opens MobileMenu with appropriate items

Avatar component:
  - Use shadcn Avatar
  - Show user initials if no avatarUrl
  - bg-accent text-accent-fg for initials
  - Sign Out: use Clerk SignOutButton component

Files:
- src/components/layout/Header.tsx (create)
- src/components/layout/MobileMenu.tsx should already exist

Also update src/app/[locale]/layout.tsx to include <Header /> above {children}.

Show me all diffs.
```

**Что проверять:**

```tsx
// ✅ Header — Server Component с async
export default async function Header() {
  const user = await getHeaderUser();
  const t = await getTranslations('common.nav');

  // nav строится на основе user.status и user.role
}

// ❌ не должно быть
('use client'); // Header серверный
useUser(); // хук Clerk — только клиент
```

Знак рекомендации должен быть `✦` (звёздочка), не `*` и не `⭐`:

```tsx
// ✅
<span className="text-accent">✦</span>;
{
  t('recommend');
}

// ❌ нет emoji в навигации
```

Sign Out — через Clerk компонент:

```tsx
// ✅
import { SignOutButton } from '@clerk/nextjs';

<SignOutButton>
  <button className="...">Sign Out</button>
</SignOutButton>;

// ❌
router.push('/api/auth/signout'); // нет такого роута
```

```bash
pnpm dev

# тест 1 (не авторизован): localhost:3000/en
# → Header показывает: KCLUB | Directory | Verify Card | [Sign In] [Join Now]

# тест 2 (авторизован): войдите через Clerk
# → Header показывает: KCLUB | Directory | Dashboard | [Аватар]

# мобильный тест: resize до 375px
# → видна только кнопка гамбургера, по клику слайдится меню

pnpm typecheck
# → 0 errors

git add src/components/layout/ src/features/auth/ src/app/
git commit -m "feat(b02): auth-aware Header with role-based nav, mobile menu, Clerk SignOut"
```

---

## Шаг B02.07 — UI-атомы

Вставьте в Cursor Agent:

```
Create 5 small reusable UI components.
Read /docs/DESIGN.md §8.2 (custom components list) and §8.5 (status colors).

Each component should be small — max 50 lines each.
Show me all 5 diffs together, then I'll accept.

1. src/components/ui/StatusBadge.tsx
   - Props: status (string), className?
   - Maps status strings to colors per DESIGN.md §8.5 status table:
     'PUBLISHED' | 'ACTIVE' → success colors
     'PENDING' | 'UNDER_REVIEW' → warning colors
     'DRAFT' → muted colors
     'HIDDEN' | 'INACTIVE' → subtle colors
     'REJECTED' | 'BANNED' | 'EXPIRED' → danger colors
   - Uses shadcn Badge as base
   - Shows status text in UPPER_CASE with a colored dot before it
   - aria-label={`Status: ${status}`}

2. src/components/ui/GoldDivider.tsx
   - Props: className?
   - Thin horizontal line: border-t border-accent/30
   - Optional decorative dot in center: small gold diamond ◆
   - Used between sections on marketing pages

3. src/components/ui/EmptyState.tsx
   - Props: icon? (LucideIcon), title, description?, action? (ReactNode)
   - Centered, py-16, text-center
   - Icon: size-12 text-fg-subtle mb-4
   - Title: text-heading-m text-fg
   - Description: text-body-s text-fg-muted mt-2 max-w-sm mx-auto
   - Action: mt-6 (usually a Button)

4. src/components/ui/LoadingSpinner.tsx
   - Props: size? ('sm'|'md'|'lg'), className?
   - Animated spinning circle using CSS animation
   - Colors: border-border border-t-accent (gold spinner on dark border)
   - Sizes: sm=16px, md=24px, lg=40px
   - role="status" aria-label="Loading"

5. src/components/ui/ErrorMessage.tsx
   - Props: message, id? (for aria-describedby)
   - Small error text below form fields
   - text-caption text-danger
   - role="alert"
   - Small X circle icon from lucide-react before text

Files to create:
- src/components/ui/StatusBadge.tsx
- src/components/ui/GoldDivider.tsx
- src/components/ui/EmptyState.tsx
- src/components/ui/LoadingSpinner.tsx
- src/components/ui/ErrorMessage.tsx

Show me all 5 diffs.
```

**Что проверять:**

`StatusBadge` — проверьте статус-маппинг полностью:

```tsx
// ✅ все статусы покрыты
const statusConfig = {
  PUBLISHED: { bg: "bg-success-muted", text: "text-success", border: "border-success/30" },
  ACTIVE:    { bg: "bg-success-muted", text: "text-success", border: "border-success/30" },
  PENDING:   { bg: "bg-warning-muted", text: "text-warning", border: "border-warning/30" },
  UNDER_REVIEW: { ... },
  DRAFT:     { ... },
  HIDDEN:    { ... },
  INACTIVE:  { ... },
  REJECTED:  { ... },
  BANNED:    { ... },
  EXPIRED:   { ... },
} as const;
```

`LoadingSpinner` — не использует `framer-motion` или внешние библиотеки:

```tsx
// ✅ чистый CSS
<div
  role="status"
  aria-label="Loading"
  className={cn(
    'animate-spin rounded-full border-2 border-border border-t-accent',
    sizeClasses[size],
    className,
  )}
/>

// ❌ не нужен framer-motion для спиннера
```

```bash
pnpm typecheck
# → 0 errors

git add src/components/ui/StatusBadge.tsx \
        src/components/ui/GoldDivider.tsx \
        src/components/ui/EmptyState.tsx \
        src/components/ui/LoadingSpinner.tsx \
        src/components/ui/ErrorMessage.tsx

git commit -m "feat(b02): UI atoms — StatusBadge, GoldDivider, EmptyState, Spinner, ErrorMessage"
```

---

## Шаг B02.08 — Home page placeholder + финальная проверка

Вставьте в Cursor Agent:

```
Update src/app/[locale]/page.tsx to be a minimal but real home page placeholder.
We'll build the full home in B08, but now we need to verify the layout shell works.

Requirements:
- Server Component
- Use PageWrapper from @/components/layout/PageWrapper
- Show:
  1. A centered section with:
     - h1 "Private Business Club" in font-display text-display-m text-fg
     - Gold divider (GoldDivider component) below
     - p "Coming soon. Registration opens shortly." text-body-m text-fg-muted
  2. Below that: show the current auth state for testing:
     - If not authed: show "Not signed in" in text-caption text-fg-subtle
     - If authed: show "Signed in as [role]" — get role from getHeaderUser()

This is a development placeholder only. Keep it under 40 lines.

File: src/app/[locale]/page.tsx (modify)
Show me the diff.
```

---

## Финальная проверка B02

```bash
# полный gate
pnpm lint && pnpm typecheck && pnpm build

# ожидаем:
# lint   → 0 errors
# type   → 0 errors
# build  → ✓ Compiled successfully

# запуск для визуальной проверки
pnpm dev
```

Открываете браузер и проверяете 5 вещей:

```
[ ] localhost:3000 → редирект на localhost:3000/en  ✓
[ ] localhost:3000/en → тёмный фон #0a0a0b, тексты видны  ✓
[ ] Header вверху: "KCLUB" (gold) + nav links + кнопки  ✓
[ ] Footer внизу: disclaimer + ссылки + копирайт  ✓
[ ] Resize до 375px → гамбургер вместо nav, меню открывается  ✓
[ ] localhost:3000/en/m/dashboard → редирект на sign-in  ✓
[ ] localhost:3000/en/directory → открывается (empty page, нет редиректа)  ✓
```

Если всё галочки:

```bash
git log --oneline
# feat(b02): UI atoms
# feat(b02): auth-aware Header with role-based nav, mobile menu, Clerk SignOut
# feat(b02): Container, PageWrapper, Footer components + layout wiring
# feat(b02): combined Clerk v6 + next-intl middleware with route protection
# feat(b02): root layout, [locale] layout, fonts, Clerk+i18n providers, globals.css tokens
# feat(b02): next-intl config, message files, typed env loader
# feat(b02): add next-intl, clerk, upstash, zod env deps
# feat(b01): establish project folder structure + env loader + logger
# feat(b01): add shadcn/ui with dark theme adaptation
# feat(b01): add dark/gold Tailwind v4 design tokens
# feat(b01): scaffold Next.js 15 + React 19 + TS strict + Tailwind v4

git push origin feat/b02-design-system
# открыть PR → merge в main
```

---

## Что делать если что-то сломалось

### Hydration mismatch от Header

```
I'm getting a React hydration error on the Header component.
The server renders different HTML than the client expects.
The likely cause is auth state differing between server and client render.
Fix by ensuring auth state is resolved server-side only inside getHeaderUser(),
and the Header stays a pure Server Component without any useState.
```

### next-intl `MISSING_MESSAGE` в консоли

```
next-intl shows MISSING_MESSAGE for key X.
Check messages/en/common.json — the key path must match exactly.
Show me the current messages files and the component that uses the key.
```

### Clerk redirects loop (знак-in редиректит на знак-in)

```
After signing in, the app keeps redirecting back to sign-in.
This is likely the middleware protecting the wrong routes or
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL pointing to a protected route
before auth state propagates.
Check middleware.ts isProtectedRoute pattern and the Clerk env vars.
```

### Tailwind классы не применяются

```
Tailwind classes bg-surface, text-accent etc are not working.
Check src/app/globals.css:
1. First line must be @import "tailwindcss" (not @tailwind base)
2. @theme block must use --color-surface not --surface
3. In next.config.ts check that Tailwind v4 plugin is configured correctly
Show me globals.css and next.config.ts
```

---

## Итог B02 → что готово, что следующее

После B02 у вас есть **полноценный shell**: тёмная тема, золотые акценты, Header с ролевой навигацией, Footer с легальным копирайтом, middleware с защитой роутов, типизированный env, 5 UI-атомов.

**Следующий: B03 — Database schema + Drizzle migrations.**

Там мы закоммитим все 9 таблиц из нашей упрощённой схемы, запустим первую миграцию против Supabase, и засеем тестовыми данными (countries, categories, test businesses). После B03 у нас есть данные — и тогда B09 (каталог) и B11 (дашборд) станут конкретными а не placeholder'ами.

Скажите «готов к B03» когда Header виден и `pnpm build` зелёный.
