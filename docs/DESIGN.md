# `docs/DESIGN.md`

> Current-context guard, refreshed 2026-06-06: visual tokens and layout guidance
> remain useful, but auth-specific references to Clerk are historical. Current
> auth is Supabase Auth phone-first; use `docs/STACK-DECISION.md`,
> `docs/SPEC.md`, and `docs/LEGACY-CONTEXT.md` when auth UI guidance conflicts.

Куда класть: `docs/DESIGN.md` (папка `docs/` уже существует).

````md
# DESIGN.md — KCLUB MVP Design System

> Single source of truth for visual decisions.
> Agents read this file when generating UI components.
> Designers reference this before creating assets.
> Developers reject PRs that introduce undocumented visual patterns.

---

## Table of contents

1. [Design principles](#1-design-principles)
2. [Color tokens](#2-color-tokens)
3. [Typography](#3-typography)
4. [Spacing & layout](#4-spacing--layout)
5. [Shadows & elevation](#5-shadows--elevation)
6. [Border radius](#6-border-radius)
7. [Motion & animation](#7-motion--animation)
8. [Component inventory](#8-component-inventory)
9. [Page-by-page specs](#9-page-by-page-specs)
10. [Responsive breakpoints](#10-responsive-breakpoints)
11. [Accessibility](#11-accessibility)
12. [Asset specifications](#12-asset-specifications)
13. [Agent rules for UI generation](#13-agent-rules-for-ui-generation)

---

## 1. Design principles

### 1.1 Brand personality

KCLUB is a **private business club**. The visual language communicates:

- **Exclusivity** — dark palette, gold accents, refined whitespace.
- **Trust** — clean hierarchy, no clutter, readable copy.
- **Professionalism** — geometric precision, consistent spacing, serious typography.
- **Accessibility** — contrast ratios honored even on dark backgrounds.

### 1.2 What we are NOT

- Not a SaaS dashboard (no blue #3b82f6, no rounded-3xl everywhere).
- Not a crypto project (no neon, no gradients from green to purple).
- Not a startup (no emojis in headings, no "🚀 Join now!").
- Not a luxury fashion brand (no serif everywhere, no thin fonts at 14px).

### 1.3 Dark-first

There is **one theme: dark**. No light mode in MVP. No `dark:` variant classes.
All color decisions are made assuming a near-black canvas.

### 1.4 Mobile-first

Every component is designed for 375px viewport first, then scales up.
No "desktop-only" features in MVP.

---

## 2. Color tokens

Defined in `src/app/globals.css` under `@theme`. Used via Tailwind utility
classes (`bg-bg`, `text-accent`, etc.). Never use raw hex in components.

### 2.1 Full token table

| Token           | CSS Variable            | Hex         | Usage                            |
| --------------- | ----------------------- | ----------- | -------------------------------- |
| `bg`            | `--color-bg`            | `#0a0a0b`   | Page background                  |
| `surface`       | `--color-surface`       | `#16161a`   | Card, modal, sidebar background  |
| `surface-2`     | `--color-surface-2`     | `#1f1f25`   | Elevated card, input background  |
| `surface-3`     | `--color-surface-3`     | `#27272e`   | Hover state on surface           |
| `border`        | `--color-border`        | `#2a2a32`   | All borders and dividers         |
| `border-strong` | `--color-border-strong` | `#3d3d47`   | Focus ring base, strong dividers |
| `fg`            | `--color-fg`            | `#f5f5f0`   | Primary text                     |
| `fg-muted`      | `--color-fg-muted`      | `#a8a8a0`   | Secondary text, placeholders     |
| `fg-subtle`     | `--color-fg-subtle`     | `#6b6b66`   | Disabled text, metadata          |
| `accent`        | `--color-accent`        | `#d4af37`   | Gold — primary brand color       |
| `accent-hover`  | `--color-accent-hover`  | `#e6c14a`   | Gold hover state                 |
| `accent-muted`  | `--color-accent-muted`  | `#d4af3720` | Gold tint (backgrounds)          |
| `accent-fg`     | `--color-accent-fg`     | `#0a0a0b`   | Text ON gold backgrounds         |
| `danger`        | `--color-danger`        | `#ef4444`   | Error, destructive actions       |
| `danger-muted`  | `--color-danger-muted`  | `#ef444420` | Error background tint            |
| `success`       | `--color-success`       | `#22c55e`   | Success states                   |
| `success-muted` | `--color-success-muted` | `#22c55e20` | Success background tint          |
| `warning`       | `--color-warning`       | `#f59e0b`   | Warnings, PENDING status         |
| `warning-muted` | `--color-warning-muted` | `#f59e0b20` | Warning background tint          |
| `info`          | `--color-info`          | `#60a5fa`   | Informational, links             |

### 2.2 Status color mapping

Used for badges on businesses, memberships, cards:

| Status                 | Background      | Text        | Border           |
| ---------------------- | --------------- | ----------- | ---------------- |
| PUBLISHED / ACTIVE     | `success-muted` | `success`   | `success` at 30% |
| PENDING / UNDER_REVIEW | `warning-muted` | `warning`   | `warning` at 30% |
| DRAFT                  | `surface-2`     | `fg-muted`  | `border`         |
| HIDDEN / INACTIVE      | `surface-2`     | `fg-subtle` | `border`         |
| REJECTED / BANNED      | `danger-muted`  | `danger`    | `danger` at 30%  |
| EXPIRED                | `surface-2`     | `fg-subtle` | `border`         |

### 2.3 globals.css `@theme` block

```css
/* src/app/globals.css */
@import 'tailwindcss';

@theme {
  /* Backgrounds */
  --color-bg: #0a0a0b;
  --color-surface: #16161a;
  --color-surface-2: #1f1f25;
  --color-surface-3: #27272e;

  /* Borders */
  --color-border: #2a2a32;
  --color-border-strong: #3d3d47;

  /* Foreground / text */
  --color-fg: #f5f5f0;
  --color-fg-muted: #a8a8a0;
  --color-fg-subtle: #6b6b66;

  /* Brand accent — gold */
  --color-accent: #d4af37;
  --color-accent-hover: #e6c14a;
  --color-accent-muted: rgb(212 175 55 / 0.12);
  --color-accent-fg: #0a0a0b;

  /* Semantic */
  --color-danger: #ef4444;
  --color-danger-muted: rgb(239 68 68 / 0.12);
  --color-success: #22c55e;
  --color-success-muted: rgb(34 197 94 / 0.12);
  --color-warning: #f59e0b;
  --color-warning-muted: rgb(245 158 11 / 0.12);
  --color-info: #60a5fa;

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Playfair Display', Georgia, 'Times New Roman', serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgb(0 0 0 / 0.4);
  --shadow-md: 0 4px 12px rgb(0 0 0 / 0.5);
  --shadow-lg: 0 8px 32px rgb(0 0 0 / 0.6);
  --shadow-gold: 0 0 24px rgb(212 175 55 / 0.15);
  --shadow-glow: 0 0 48px rgb(212 175 55 / 0.08);
}

/* Base styles */
body {
  background-color: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Focus ring — global */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Scrollbar — dark theme */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: var(--color-surface);
}
::-webkit-scrollbar-thumb {
  background: var(--color-border-strong);
  border-radius: var(--radius-full);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-fg-subtle);
}
```

---

## 3. Typography

### 3.1 Font stack

| Role               | Font             | Fallback              | Usage                                        |
| ------------------ | ---------------- | --------------------- | -------------------------------------------- |
| Body / UI          | Inter            | system-ui, sans-serif | Everything except headings                   |
| Display / Headings | Playfair Display | Georgia, serif        | H1, H2 on marketing pages, card "KCLUB" logo |
| Mono               | JetBrains Mono   | Fira Code, Consolas   | Card numbers, code examples                  |

**Loading strategy** (`src/app/layout.tsx`):

```tsx
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'cyrillic'], // cyrillic for Phase-2 ru/uk
  variable: '--font-sans',
  display: 'swap',
});
const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  display: 'swap',
});
```

### 3.2 Type scale

| Name       | Class             | Size            | Line height | Weight | Usage                         |
| ---------- | ----------------- | --------------- | ----------- | ------ | ----------------------------- |
| Display XL | `text-display-xl` | 56px / 3.5rem   | 1.1         | 700    | Hero headline (H1, marketing) |
| Display L  | `text-display-l`  | 40px / 2.5rem   | 1.15        | 700    | Section headline              |
| Display M  | `text-display-m`  | 32px / 2rem     | 1.2         | 700    | Page H1 in app                |
| Heading L  | `text-heading-l`  | 24px / 1.5rem   | 1.3         | 600    | H2, card titles               |
| Heading M  | `text-heading-m`  | 20px / 1.25rem  | 1.35        | 600    | H3, sidebar sections          |
| Heading S  | `text-heading-s`  | 16px / 1rem     | 1.4         | 600    | H4, table headers             |
| Body L     | `text-body-l`     | 18px / 1.125rem | 1.6         | 400    | Hero body copy                |
| Body M     | `text-body-m`     | 16px / 1rem     | 1.6         | 400    | Main UI text                  |
| Body S     | `text-body-s`     | 14px / 0.875rem | 1.5         | 400    | Secondary UI text             |
| Caption    | `text-caption`    | 12px / 0.75rem  | 1.4         | 400    | Timestamps, metadata          |
| Label      | `text-label`      | 12px / 0.75rem  | 1           | 600    | Input labels, badges          |

Add to `@theme`:

```css
@theme {
  /* ... colors above ... */

  --text-display-xl: 3.5rem;
  --text-display-l: 2.5rem;
  --text-display-m: 2rem;
  --text-heading-l: 1.5rem;
  --text-heading-m: 1.25rem;
  --text-heading-s: 1rem;
  --text-body-l: 1.125rem;
  --text-body-m: 1rem;
  --text-body-s: 0.875rem;
  --text-caption: 0.75rem;
  --text-label: 0.75rem;
}
```

### 3.3 Usage rules

- **Display fonts (Playfair Display)**: only on marketing hero, section headlines, and the KCLUB wordmark. Never on body copy, buttons, or UI labels.
- **Minimum body size**: 14px. Never smaller for reading content.
- **Line length**: max 70 characters for body copy (`max-w-[65ch]`). Long lines hurt legibility.
- **All caps**: only for short labels (badge text, section labels). Max 4 words.
- **Letter spacing on all-caps**: always `tracking-widest` (0.1em).

---

## 4. Spacing & layout

### 4.1 Spacing scale

We use Tailwind's default scale (`4px` base unit). Key values:

| Token      | px   | Usage                         |
| ---------- | ---- | ----------------------------- |
| `space-1`  | 4px  | Micro gaps, icon-text gap     |
| `space-2`  | 8px  | Inside compact components     |
| `space-3`  | 12px | Between related elements      |
| `space-4`  | 16px | Default component padding     |
| `space-5`  | 20px | —                             |
| `space-6`  | 24px | Section padding, card padding |
| `space-8`  | 32px | Between sections (mobile)     |
| `space-10` | 40px | —                             |
| `space-12` | 48px | Between sections (desktop)    |
| `space-16` | 64px | Large section separation      |
| `space-20` | 80px | Hero sections                 |
| `space-24` | 96px | Above-fold hero               |

### 4.2 Max-widths

| Name               | Value  | Where                        |
| ------------------ | ------ | ---------------------------- |
| `max-w-screen-sm`  | 640px  | Narrow content (auth forms)  |
| `max-w-screen-md`  | 768px  | Article-width content        |
| `max-w-screen-lg`  | 1024px | Standard app container       |
| `max-w-screen-xl`  | 1280px | Wide app container (default) |
| `max-w-screen-2xl` | 1536px | Max site width               |

**Default page container:**

```tsx
// src/components/layout/Container.tsx
export function Container({ children, className }: Props) {
  return (
    <div className={cn('mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}
```

### 4.3 Grid system

- **12-column CSS Grid** for complex layouts.
- **Flexbox** for component-level layouts.
- **gap-6** (24px) between grid columns.

Standard layout patterns:

```
1 column   → full width (mobile default)
2 columns  → sidebar + content: grid-cols-1 lg:grid-cols-[280px_1fr]
3 columns  → catalog cards: grid-cols-1 sm:grid-cols-2 xl:grid-cols-3
4 columns  → stats, features: grid-cols-2 lg:grid-cols-4
```

---

## 5. Shadows & elevation

Dark theme uses opacity-based shadows. Elements "float" via layered shadows.

| Name          | Value                             | When to use                       |
| ------------- | --------------------------------- | --------------------------------- |
| `shadow-sm`   | `0 1px 3px rgb(0 0 0 / 0.4)`      | Subtle card lift                  |
| `shadow-md`   | `0 4px 12px rgb(0 0 0 / 0.5)`     | Cards, dropdowns                  |
| `shadow-lg`   | `0 8px 32px rgb(0 0 0 / 0.6)`     | Modals, popovers                  |
| `shadow-gold` | `0 0 24px rgb(212 175 55 / 0.15)` | Featured cards, CTA buttons hover |
| `shadow-glow` | `0 0 48px rgb(212 175 55 / 0.08)` | Hero decorative glow              |

### Elevation system

Stacking order (higher number = more elevated):

| Level | Background     | Shadow      | Usage                    |
| ----- | -------------- | ----------- | ------------------------ |
| 0     | `bg-bg`        | none        | Page background          |
| 1     | `bg-surface`   | `shadow-sm` | Standard cards           |
| 2     | `bg-surface-2` | `shadow-md` | Elevated cards, inputs   |
| 3     | `bg-surface-3` | `shadow-lg` | Dropdowns, tooltips      |
| 4     | `bg-surface`   | `shadow-lg` | Modals (over an overlay) |

---

## 6. Border radius

| Token          | Value  | Usage                               |
| -------------- | ------ | ----------------------------------- |
| `rounded-sm`   | 4px    | Badges, tags, small inputs          |
| `rounded-md`   | 8px    | Buttons, inputs, most components    |
| `rounded-lg`   | 12px   | Cards                               |
| `rounded-xl`   | 16px   | Large cards, feature boxes          |
| `rounded-2xl`  | 24px   | Hero cards, modals                  |
| `rounded-full` | 9999px | Avatars, pill badges, round buttons |

**Rule:** don't mix radius sizes within one component. Pick one and stick to it.

---

## 7. Motion & animation

### 7.1 Principles

- **Purposeful**: only animate when it helps the user understand a state change.
- **Fast**: transitions < 300ms. Nothing drags.
- **Consistent**: same easing curve across the product.

### 7.2 Easing curves

| Name          | Value                          | Usage                                  |
| ------------- | ------------------------------ | -------------------------------------- |
| `ease-out`    | `cubic-bezier(0, 0, 0.2, 1)`   | Enter animations (element appearing)   |
| `ease-in`     | `cubic-bezier(0.4, 0, 1, 1)`   | Exit animations (element disappearing) |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | State changes (color, size)            |

Add to `@theme`:

```css
@theme {
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 7.3 Duration scale

| Token          | Value | Usage                              |
| -------------- | ----- | ---------------------------------- |
| `duration-75`  | 75ms  | Micro: focus ring, checkbox        |
| `duration-150` | 150ms | Short: button hover, badge         |
| `duration-200` | 200ms | Default: most transitions          |
| `duration-300` | 300ms | Medium: dropdown open, modal       |
| `duration-500` | 500ms | Long: page enter, skeleton shimmer |

### 7.4 Standard transitions per component

| Component     | Property                         | Duration | Easing              |
| ------------- | -------------------------------- | -------- | ------------------- |
| Button        | `background-color`, `box-shadow` | 150ms    | ease-in-out         |
| Card          | `transform`, `box-shadow`        | 200ms    | ease-out            |
| Dropdown      | `opacity`, `transform`           | 150ms    | ease-out            |
| Modal overlay | `opacity`                        | 200ms    | ease-in-out         |
| Modal panel   | `transform`, `opacity`           | 200ms    | ease-out            |
| Skeleton      | `opacity`                        | 1500ms   | ease-in-out (pulse) |
| Toast         | `transform`, `opacity`           | 300ms    | ease-out            |

### 7.5 Reduced motion

Always wrap decorative animations:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Component inventory

### 8.1 shadcn/ui components (installed in MVP)

All live in `src/components/ui/`. Modified to use our token system.

| Component     | File                | Used on pages              |
| ------------- | ------------------- | -------------------------- |
| Button        | `button.tsx`        | All                        |
| Input         | `input.tsx`         | Auth, forms                |
| Label         | `label.tsx`         | Auth, forms                |
| Textarea      | `textarea.tsx`      | Introduction form          |
| Select        | `select.tsx`        | Introduction form, filters |
| Card          | `card.tsx`          | Directory, dashboard       |
| Badge         | `badge.tsx`         | Status labels everywhere   |
| Avatar        | `avatar.tsx`        | Header, dashboard          |
| Dialog        | `dialog.tsx`        | Confirmations, previews    |
| Dropdown Menu | `dropdown-menu.tsx` | Header user menu           |
| Table         | `table.tsx`         | Admin panel                |
| Separator     | `separator.tsx`     | Layout                     |
| Skeleton      | `skeleton.tsx`      | Loading states             |

### 8.2 Custom components (to build in B02)

| Component        | Path                                    | Description                              |
| ---------------- | --------------------------------------- | ---------------------------------------- |
| `Container`      | `components/layout/Container.tsx`       | Centered, max-width wrapper              |
| `Header`         | `components/layout/Header.tsx`          | Top nav, auth-aware                      |
| `Footer`         | `components/layout/Footer.tsx`          | Legal links, minimal                     |
| `PageWrapper`    | `components/layout/PageWrapper.tsx`     | Main layout, padding                     |
| `StatusBadge`    | `components/ui/StatusBadge.tsx`         | Colored badge by status string           |
| `GoldDivider`    | `components/ui/GoldDivider.tsx`         | Thin gold horizontal line (decorative)   |
| `ClubCard`       | `components/cards/ClubCard.tsx`         | Physical-looking digital membership card |
| `BusinessCard`   | `components/directory/BusinessCard.tsx` | Card in the catalog grid                 |
| `EmptyState`     | `components/ui/EmptyState.tsx`          | Empty list placeholder                   |
| `ErrorMessage`   | `components/ui/ErrorMessage.tsx`        | Form field error                         |
| `LoadingSpinner` | `components/ui/LoadingSpinner.tsx`      | Inline loading                           |
| `ConfirmDialog`  | `components/ui/ConfirmDialog.tsx`       | Are-you-sure modal                       |
| `AdminLayout`    | `components/admin/AdminLayout.tsx`      | Admin sidebar + content                  |

### 8.3 Button variants

```tsx
// Four variants. All use `rounded-md`, `h-11` (44px) minimum.

// Primary — gold background, dark text
<Button variant="default">Join Now</Button>
// bg-accent text-accent-fg hover:bg-accent-hover shadow-gold on hover

// Secondary — surface background, muted border
<Button variant="secondary">View Directory</Button>
// bg-surface-2 text-fg border border-border hover:bg-surface-3

// Outline — transparent, border
<Button variant="outline">Learn More</Button>
// bg-transparent text-fg border border-border hover:bg-surface-2

// Destructive — danger red
<Button variant="destructive">Delete</Button>
// bg-danger-muted text-danger border border-danger hover:bg-danger

// Ghost — no background or border
<Button variant="ghost">Cancel</Button>
// bg-transparent text-fg-muted hover:bg-surface-2 hover:text-fg
```

Sizes:

```tsx
<Button size="sm">Small</Button>   // h-8, text-body-s, px-3 — for table actions
<Button size="default">Default</Button>  // h-11, text-body-m, px-6
<Button size="lg">Large</Button>   // h-14, text-body-l, px-8 — for CTAs
<Button size="icon">⋯</Button>    // h-11 w-11, square
```

### 8.4 Card variants

```tsx
// Standard card
<Card> // bg-surface border border-border rounded-lg shadow-sm p-6

// Highlighted card (featured business, top partner)
<Card className="border-accent/40 shadow-gold">

// Clickable card (with hover)
<Card className="cursor-pointer transition-all duration-200
                 hover:-translate-y-0.5 hover:shadow-gold hover:border-accent/40">
```

### 8.5 Input states

```
Default:  bg-surface-2 border-border text-fg
Focus:    border-accent (ring via :focus-visible global)
Error:    border-danger bg-danger-muted
Disabled: opacity-50 cursor-not-allowed
```

---

## 9. Page-by-page specs

### 9.1 Home Page — не авторизован (`/en`)

**Purpose:** Conversion. Убедить посетителя зарегистрироваться или войти.

**Sections (top to bottom):**

```
┌─────────────────────────────────────────┐
│ HEADER: Logo | Directory | Verify Card  │
│         [Sign In] [Join Now →]          │
├─────────────────────────────────────────┤
│ HERO                                    │
│ ┌──────────────────────────────────┐    │
│ │ Playfair Display, 56px           │    │
│ │ "Private Business Club           │    │
│ │  for Serious Entrepreneurs"      │    │
│ │                                  │    │
│ │ 18px body, max 65ch              │    │
│ │ "KCLUB brings together..."       │    │
│ │                                  │    │
│ │ [Join as Member →]  [Directory]  │    │
│ └──────────────────────────────────┘    │
│ Decorative: abstract gold glow          │
├─────────────────────────────────────────┤
│ STATS BAR                               │
│ 200+ Members | 50+ Partners | 15+       │
│ Countries | 100+ Introductions          │
├─────────────────────────────────────────┤
│ HOW IT WORKS (3 steps)                  │
│ [Register] → [Get card] → [Network]     │
├─────────────────────────────────────────┤
│ FEATURED PARTNERS (3 cards, grid)       │
│ is_top_partner = true                   │
├─────────────────────────────────────────┤
│ CTA SECTION                             │
│ "Ready to join?" + button               │
├─────────────────────────────────────────┤
│ FOOTER                                  │
└─────────────────────────────────────────┘
```

**Key visual decisions:**

- Hero background: `bg-bg` with radial gradient glow `from-accent/5 to-transparent` positioned top-right.
- Stats bar: `bg-surface`, thin `border-y border-border`.
- Featured partners: max 3 cards to not overwhelm. `grid-cols-1 sm:grid-cols-3`.
- No images of people (no stock photos). Geometric, abstract.

---

### 9.2 Home Page — авторизован (`/en`)

**Same route, different render** — RSC checks auth, conditionally renders.

**Replaces hero with:**

```
┌─────────────────────────────────────────┐
│ Welcome back, [Name]                    │
│ Membership: VIP | Status: ACTIVE        │
│ [Go to Dashboard →]                     │
└─────────────────────────────────────────┘
```

**Shows below:**

- Featured businesses feed (personalised if we have enough data, otherwise global).
- Quick actions: "Recommend a client" (BUSINESS only), "View my card".

---

### 9.3 Регистрация участника

**Two steps:**

**Step 1 — Clerk sign-up** (`/en/sign-up`):

- Handled by Clerk's `<SignUp />` component.
- Styled via Clerk's appearance API to match our dark theme.
- After Clerk creates account → webhook fires → we create `users` row.

**Step 2 — Onboarding** (`/en/m/onboarding`):

```
┌─────────────────────────────────────────┐
│ Complete your profile                   │
│ ─────────────────────────────────────   │
│                                         │
│ Display name    [________________]      │
│                                         │
│ Country         [Select ▾]              │
│ City            [Select ▾]              │
│                                         │
│ Short bio       [________________]      │
│                 [________________]      │
│                                         │
│ [Complete →]                            │
└─────────────────────────────────────────┘
```

Layout: centered card, max-w-md, `bg-surface rounded-xl p-8 shadow-md`.
Progress indicator: simple "Step 2 of 2" text label, no complex stepper.

**Clerk appearance config** (`src/lib/auth/clerk-appearance.ts`):

```ts
export const clerkAppearance = {
  baseTheme: undefined,
  variables: {
    colorBackground: '#16161a', // surface
    colorInputBackground: '#1f1f25', // surface-2
    colorInputText: '#f5f5f0', // fg
    colorText: '#f5f5f0',
    colorTextSecondary: '#a8a8a0', // fg-muted
    colorPrimary: '#d4af37', // accent
    colorDanger: '#ef4444',
    borderRadius: '8px', // radius-md
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  elements: {
    card: 'bg-surface shadow-lg border border-border',
    formButtonPrimary: 'bg-accent text-accent-fg hover:bg-accent-hover',
    formFieldInput: 'bg-surface-2 border-border text-fg',
    footerActionLink: 'text-accent hover:text-accent-hover',
  },
};
```

---

### 9.4 Личный кабинет (`/en/m/dashboard`)

**Layout:** sidebar (desktop) + main content. Mobile: bottom tabs.

```
┌──────────────┬──────────────────────────┐
│ SIDEBAR      │ MAIN                     │
│ 280px        │ flex-1                   │
│              │                          │
│ [Avatar]     │ ┌──────────────────────┐ │
│ Name         │ │ CLUB CARD            │ │
│ Role badge   │ │ dark glass card      │ │
│              │ │ number, name, status │ │
│ ─────────    │ └──────────────────────┘ │
│ Dashboard    │                          │
│ My Card      │ ┌─────┐ ┌─────┐ ┌─────┐ │
│ Directory    │ │Stat │ │Stat │ │Stat │ │
│ Recommend ✦  │ └─────┘ └─────┘ └─────┘ │
│ My Business  │                          │
│              │ Recent introductions     │
│ ─────────    │ [table or card list]     │
│ Sign out     │                          │
└──────────────┴──────────────────────────┘
```

**Club Card visual:**

```
┌────────────────────────────────────────┐
│ KCLUB          [logo mark]             │
│                                        │
│ ████████████████  ←  QR or logo        │
│                                        │
│ VIP-UA-XXXXXXXXXX                      │
│ ■■■■■■■■■■■■■■■■  mono font           │
│                                        │
│ IVAN PETRENKO              VIP │
│ Expires 2027-01-01                     │
└────────────────────────────────────────┘
```

Styling:

```
bg: linear-gradient(135deg, #16161a 0%, #1f1f25 50%, #16161a 100%)
border: 1px solid rgb(212 175 55 / 0.3)
shadow: shadow-gold
border-radius: rounded-2xl
aspect-ratio: 85.6mm / 54mm = 1.586 (credit card ratio)
```

BUSINESS role sees "Recommend Client" nav item marked with a gold star `✦`.

---

### 9.5 Каталог партнёров (`/en/directory`)

```
┌─────────────────────────────────────────┐
│ HEADER                                  │
├─────────────────────────────────────────┤
│ Breadcrumb: Home > Directory            │
│                                         │
│ h1: "Business Directory"                │
│ Subtext: "N verified partners"          │
├─────────────────────┬───────────────────┤
│ FILTERS (left)      │ GRID (right)      │
│ 240px, sticky       │ flex-1            │
│                     │                   │
│ Search [_______]    │ ┌────┐ ┌────┐    │
│                     │ │card│ │card│    │
│ Category            │ └────┘ └────┘    │
│ ○ All               │ ┌────┐ ┌────┐    │
│ ○ Tech              │ │card│ │card│    │
│ ○ Finance           │ └────┘ └────┘    │
│ ○ ...               │                   │
│                     │ [Load more]       │
│ Country             │                   │
│ [Select ▾]          │                   │
│                     │                   │
│ [Reset filters]     │                   │
└─────────────────────┴───────────────────┘
```

Mobile: filters hidden behind "Filters" button → opens as bottom sheet dialog.

**Business card in grid:**

```
┌────────────────────────┐
│ [Logo 64x64] ┌────────┐│
│              │ TOP ★  ││  ← if is_top_partner
│              └────────┘│
│ Business Name           │
│ Category • Country      │
│                         │
│ Short description...    │
│ (2 lines, truncated)    │
│                         │
│ [View →]                │
└────────────────────────┘
```

Grid: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6`.
Cards: `bg-surface border border-border rounded-lg p-6 shadow-sm`.
Top partner: `border-accent/40 shadow-gold`.

**Auth-gated content:**

- Not logged in: sees business name, category, country. Description truncated `after:content-['...']`. On click: redirect to sign-up with `?redirect=/directory/[slug]`.
- Logged in: sees full description, contact button, partner offers.

---

### 9.6 Карточка партнёра (`/en/directory/[slug]`)

```
┌─────────────────────────────────────────┐
│ HEADER                                  │
├─────────────────────────────────────────┤
│ Breadcrumb: Home > Directory > [Name]   │
├──────────────────────┬──────────────────┤
│ MAIN (lg:col-span-8) │ SIDEBAR          │
│                      │ (lg:col-span-4)  │
│ Logo + Name + badges │                  │
│ ─────────────────    │ Contact card     │
│ Full description     │ ┌──────────────┐ │
│                      │ │Website: ...  │ │
│ ─────────────────    │ │Phone: ...    │ │
│ Partner Offers       │ │Email: ...    │ │
│ (only if logged in)  │ └──────────────┘ │
│                      │                  │
│ ─────────────────    │ [Recommend a     │
│ Location info        │  client →]       │
│                      │ (BUSINESS only)  │
└──────────────────────┴──────────────────┘
```

**Partner offers (auth-gated):**

```
┌──────────────────────────────────────────┐
│ 🔒 Special Offers                        │
│    Sign in to see exclusive offers       │
│    from this partner.                    │
│    [Sign In]                             │
└──────────────────────────────────────────┘
```

When logged in:

```
┌──────────────────────────────────────────┐
│ ★ Special Offers for Club Members        │
│ ┌────────────────────────────────────┐   │
│ │ -20% on first consultation         │   │
│ │ Valid until: 2026-12-31            │   │
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

---

### 9.7 Рекомендовать клиента (`/en/m/introduce`)

Access: BUSINESS role only. FREE users see an upgrade prompt (no Stripe in MVP — just a "Contact us" message).

```
┌─────────────────────────────────────────┐
│ HEADER                                  │
├─────────────────────────────────────────┤
│ h1: "Recommend a Client"                │
│ Subtext: explain what Business          │
│ Introductions are. ~2 sentences.        │
├──────────────────────┬──────────────────┤
│ FORM (max-w-lg)      │ HOW IT WORKS     │
│                      │ sidebar, sticky  │
│ Select partner:      │                  │
│ [Searchable select ▾]│ 1. Fill the form │
│                      │ 2. Admin reviews │
│ Client name:         │ 3. Partners      │
│ [____________]       │    connect       │
│                      │                  │
│ Client contact:      │ ⚠️ Note:         │
│ [____________]       │ We do NOT share  │
│ phone or email       │ contact info     │
│                      │ without consent. │
│ Message to partner:  │                  │
│ [____________]       │                  │
│ [____________]       │                  │
│                      │                  │
│ [Turnstile widget]   │                  │
│                      │                  │
│ [Submit →]           │                  │
└──────────────────────┴──────────────────┘
```

After submit: success state (same page, no redirect):

```
┌─────────────────────────────────────────┐
│ ✓ Introduction submitted                │
│                                         │
│ Our team will review and connect        │
│ you with [Partner Name] within          │
│ 2 business days.                        │
│                                         │
│ [Submit another] [Go to Dashboard]      │
└─────────────────────────────────────────┘
```

---

### 9.8 MVP Admin Panel (`/en/admin/*`)

Access: ADMIN role + 2FA required.

**Admin layout:**

```
┌──────────────┬──────────────────────────┐
│ ADMIN        │ CONTENT AREA             │
│ SIDEBAR      │                          │
│ 240px        │                          │
│              │                          │
│ ⬡ KCLUB     │                          │
│   Admin      │                          │
│ ─────────    │                          │
│ Dashboard    │                          │
│ Users        │                          │
│ Businesses   │                          │
│ Categories   │                          │
│ Introductions│                          │
│ Cards        │                          │
│ Audit Log    │                          │
│ ─────────    │                          │
│ ← Back       │                          │
└──────────────┴──────────────────────────┘
```

Sidebar background: `bg-surface border-r border-border`.
Content area: `bg-bg`.

**Admin modules (MVP minimum):**

| Route                  | Page                | Key actions                                     |
| ---------------------- | ------------------- | ----------------------------------------------- |
| `/admin`               | Dashboard           | User count, business count, pending queue count |
| `/admin/users`         | Users table         | List, search, view, change role, ban            |
| `/admin/businesses`    | Businesses table    | List, filter by status, approve/reject/hide     |
| `/admin/introductions` | Introductions table | List, approve/reject, add admin note            |
| `/admin/cards`         | Cards table         | List, revoke                                    |
| `/admin/categories`    | Categories CRUD     | Add/edit/delete categories                      |
| `/admin/audit`         | Audit log           | Read-only, filter by action/user/date           |

**Table design pattern:**

```
┌─────────────────────────────────────────────────┐
│ [Search ___________] [Filter ▾]    [+ Add new]  │
├──────┬──────────────┬────────┬──────────┬───────┤
│  ID  │ Name         │ Status │ Created  │       │
├──────┼──────────────┼────────┼──────────┼───────┤
│ ...  │ Acme Coffee  │PENDING │2026-05-01│[•••]  │
│ ...  │ Tech Labs    │PUBLISHD│2026-04-28│[•••]  │
└──────┴──────────────┴────────┴──────────┴───────┘
│ Showing 1-20 of 47    [← Prev] [1][2][3] [Next →]│
└─────────────────────────────────────────────────┘
```

Row actions `[•••]` dropdown:

- Businesses: "Approve", "Reject", "Hide", "View public page"
- Users: "View", "Change role", "Ban"
- Introductions: "Approve", "Reject", "Add note"

---

## 10. Responsive breakpoints

| Name  | Width    | Design target                         |
| ----- | -------- | ------------------------------------- |
| `sm`  | ≥ 640px  | Large phone (landscape), small tablet |
| `md`  | ≥ 768px  | Tablet portrait                       |
| `lg`  | ≥ 1024px | Laptop, desktop                       |
| `xl`  | ≥ 1280px | Wide desktop                          |
| `2xl` | ≥ 1536px | Max width (container stops growing)   |

### Default: mobile

- Single column layout.
- Sidebar → hidden, replaced by hamburger menu → slide-in drawer.
- Admin sidebar → bottom navigation (5 main items max).
- Directory filters → behind "Filters" button → bottom sheet.
- Club card → full width.

### `lg:` — layout splits

- Sidebar appears alongside content.
- Directory gets filter panel.
- Business card page gets the two-column layout.

### Touch targets

**All interactive elements: minimum 44×44px.** Use `min-h-11 min-w-11`
(11 × 4px = 44px). Never make a button smaller on mobile to "save space".

---

## 11. Accessibility

### 11.1 Color contrast (WCAG 2.2 AA)

Minimum ratios:

- Normal text (< 18px): **4.5:1**
- Large text (≥ 18px or ≥ 14px bold): **3:1**
- UI components (input borders, focus rings): **3:1**

Verified pairs (do not deviate without re-checking):

| Foreground          | Background        | Ratio  | Size                |
| ------------------- | ----------------- | ------ | ------------------- |
| `#f5f5f0` fg        | `#0a0a0b` bg      | 18.5:1 | ✅ all sizes        |
| `#f5f5f0` fg        | `#16161a` surface | 15.2:1 | ✅ all sizes        |
| `#a8a8a0` fg-muted  | `#0a0a0b` bg      | 7.1:1  | ✅ all sizes        |
| `#a8a8a0` fg-muted  | `#16161a` surface | 5.8:1  | ✅ all sizes        |
| `#d4af37` accent    | `#0a0a0b` bg      | 6.8:1  | ✅ all sizes        |
| `#d4af37` accent    | `#16161a` surface | 5.6:1  | ✅ all sizes        |
| `#0a0a0b` accent-fg | `#d4af37` accent  | 6.8:1  | ✅ all sizes        |
| `#6b6b66` fg-subtle | `#0a0a0b` bg      | 4.5:1  | ✅ normal text only |

**⚠️ Never use `fg-subtle` (#6b6b66) for text smaller than 18px or non-bold text < 14px.**

### 11.2 Focus management

Every interactive element must be reachable via keyboard. Rules:

- Global `:focus-visible` ring: `2px solid var(--color-accent)` (defined in globals.css).
- Modals: trap focus inside when open. Release on close. Return focus to trigger.
- Page navigation: announce route changes to screen readers via `aria-live`.
- Skip link: first element in DOM, `href="#main-content"`. Visible on focus.

```tsx
// src/app/[locale]/layout.tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 
             focus:left-4 focus:z-50 focus:px-4 focus:py-2 
             focus:bg-accent focus:text-accent-fg focus:rounded-md"
>
  Skip to content
</a>
```

### 11.3 ARIA requirements

| Component         | Required ARIA                                                    |
| ----------------- | ---------------------------------------------------------------- |
| All form fields   | `aria-label` or `<label htmlFor>` + `aria-describedby={errorId}` |
| Icon-only buttons | `aria-label="descriptive action"`                                |
| Status badges     | `role="status"` where dynamically updated                        |
| Modals            | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`          |
| Loading spinner   | `role="status"`, `aria-label="Loading..."`                       |
| Tables            | `<caption>` or `aria-label`                                      |
| Nav               | `<nav aria-label="Main navigation">`                             |
| Breadcrumbs       | `<nav aria-label="Breadcrumb">`                                  |

### 11.4 Images

Business logos: always `alt="[BusinessName] logo"`.
Decorative SVGs: `aria-hidden="true"`.
User avatars: `alt="[UserName]'s avatar"`.

---

## 12. Asset specifications

### 12.1 Logo / Wordmark

- Primary wordmark: "KCLUB" in Playfair Display, gold (`#d4af37`), with a small decorative ligature or mark.
- Favicon: 32×32 SVG, single gold letter "K" on near-black circle.
- OG image: 1200×630px, dark bg, wordmark centered, "Private Business Club" subtitle.

### 12.2 Business logo uploads

| Property     | Spec                                                |
| ------------ | --------------------------------------------------- |
| Formats      | WebP (primary), JPEG fallback                       |
| Display size | 64×64px (catalog), 96×96px (business page)          |
| Upload max   | 2MB                                                 |
| Storage      | Supabase Storage → `/logos/<business_id>/logo.webp` |
| Fallback     | First letter of business name on `bg-surface-2`     |

### 12.3 Avatars

| Property     | Spec                                       |
| ------------ | ------------------------------------------ |
| Display size | 40×40px (header, lists), 80×80px (profile) |
| Format       | Served by Clerk (their CDN)                |
| Fallback     | Initials, `bg-accent text-accent-fg`       |

### 12.4 Icons

Library: `lucide-react` (already a shadcn/ui dependency).
Size token:

| Usage              | Size | Class     |
| ------------------ | ---- | --------- |
| Inline text        | 16px | `size-4`  |
| UI default         | 20px | `size-5`  |
| Large UI           | 24px | `size-6`  |
| Hero / empty state | 48px | `size-12` |

Never scale icons with arbitrary pixel values. Use the `size-*` scale above.

### 12.5 Clerk card number format

```
<MEMBER_TYPE>-<COUNTRY_ISO2>-<CROCKFORD_BASE32_10CHARS>

VIP-UA-ABCDE12345
BUS-UA-XYZWV98765
```

Displayed in `font-mono` (JetBrains Mono), `text-body-s`, `tracking-wider`.
Always uppercase. Never hyphen-break across lines.

---

## 13. Agent rules for UI generation

When an AI agent generates UI components, it MUST follow these rules.
These supplement `AGENTS.md` and `.cursor/rules/07-tailwind-v4.mdc`.

### 13.1 Color rules

```
✅ Use token classes:   bg-bg  bg-surface  bg-surface-2  text-fg  text-fg-muted
                        text-accent  border-border

❌ Never use raw hex:   bg-[#d4af37]  text-[#0a0a0b]

❌ Never use default    bg-white  text-black  bg-gray-900  text-gray-100
   Tailwind colors:     (those assume a different palette)

❌ Never use dark:      dark:bg-gray-900  (we are dark-only, no dark: prefix)
```

### 13.2 Typography rules

```
✅ Marketing / hero headings:   font-display (Playfair Display)
✅ Everything else:             font-sans (Inter), no explicit class needed

❌ Never:                       font-display on buttons, labels, body copy
❌ Never:                       text-xs on readable content (use text-caption minimum)
❌ Never:                       font-thin or font-light (breaks on small screens)
```

### 13.3 Spacing rules

```
✅ Use Tailwind spacing scale: p-4  p-6  gap-6  mt-8
✅ Page sections:              py-16 md:py-24
✅ Card padding:               p-6

❌ Never: p-[15px]  mt-[37px]  (arbitrary spacing breaks consistency)
❌ Never: inline style={{ padding: '...' }}
```

### 13.4 Interaction rules

```
✅ Hover on cards:    hover:-translate-y-0.5 hover:shadow-gold hover:border-accent/40
✅ Hover on buttons:  handled by Button variant styles (don't add manually)
✅ All transitions:   transition-<property> duration-200 ease-in-out

❌ Never: transition-all duration-500 on interactive elements (too slow)
❌ Never: transform scale-105 on buttons (desktop only, breaks mobile feel)
```

### 13.5 Layout rules

```
✅ Page wrapper:       <Container> from @/components/layout/Container
✅ Section spacing:    py-16 md:py-24 between major sections
✅ Content max-width:  max-w-[65ch] on long-form text

❌ Never: fixed pixel widths on content (width: 800px)
❌ Never: overflow-hidden on the body (kills sticky positioning)
❌ Never: hardcoded vh units without dvh fallback
            Use: h-screen → min-h-svh or h-svh
```

### 13.6 Must-include in every form

```tsx
// ✅ Required pattern for every input field:
<div className="space-y-2">
  <Label htmlFor="fieldId">Field Name</Label>
  <Input
    id="fieldId"
    aria-describedby={errors.field ? 'fieldId-error' : undefined}
    aria-invalid={!!errors.field}
  />
  {errors.field && (
    <p id="fieldId-error" role="alert" className="text-caption text-danger">
      {errors.field.message}
    </p>
  )}
</div>
```

### 13.7 Loading states

Every piece of async content has a Skeleton placeholder:

```tsx
// ✅ Always provide loading UI
import { Skeleton } from '@/components/ui/skeleton';

// Business card skeleton
<div className="space-y-3 p-6 bg-surface rounded-lg border border-border">
  <Skeleton className="h-16 w-16 rounded-md" />
  <Skeleton className="h-5 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
  <Skeleton className="h-10 w-24" />
</div>;
```

Never show a blank white/black rectangle while loading. Always Skeleton.

---
````
