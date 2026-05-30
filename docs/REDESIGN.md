# Cursor IDE Prompt — Dashboard Design System Redesign

> **Задача:** Внедрить единую дизайн-систему в дашборд и сделать редизайн в стиле GitHub / Vercel / Supabase, не ломая бизнес-логику.

---

## PHASE 0 — Аудит перед любыми изменениями

Before writing a single line of CSS or JSX:

1. Read every file in the project. Understand the component tree, data flow, and state management patterns.
2. Create a file called `AUDIT.md` that lists:
   - All existing components (grouped: layout, data display, forms, modals, navigation)
   - All color values currently in use (raw hex/rgb — document them all)
   - All font sizes, weights, and font families currently in use
   - All spacing values (margins, paddings, gaps)
   - All existing CSS files, CSS modules, Tailwind config, or inline styles
   - Any third-party UI libraries (shadcn, MUI, Radix, etc.)
3. Do NOT proceed to Phase 1 until `AUDIT.md` is complete.

> This audit phase protects business logic from accidental breakage.

---

## PHASE 1 — Design Token System

Create a centralized design token file. Location depends on the project stack:

- **Tailwind project** → extend `tailwind.config.ts`
- **CSS Modules / global CSS** → create `styles/tokens.css` with CSS custom properties
- **Styled-components / Emotion** → create `styles/tokens.ts`

### Color Palette — GitHub / Vercel / Supabase inspired

```css
:root {
  /* === SURFACES (dark-first, like Vercel/GitHub) === */
  --color-bg: #0a0a0a; /* Page background */
  --color-surface: #111111; /* Card / panel background */
  --color-surface-2: #1a1a1a; /* Elevated surface */
  --color-surface-hover: #222222; /* Row/item hover state */
  --color-border: #262626; /* Subtle border */
  --color-border-strong: #333333; /* Stronger divider */

  /* === TEXT === */
  --color-text: #ededed; /* Primary text */
  --color-text-muted: #888888; /* Secondary / helper text */
  --color-text-faint: #444444; /* Placeholder / disabled */
  --color-text-inverse: #0a0a0a; /* Text on light backgrounds */

  /* === ACCENT (Vercel-style blue) === */
  --color-accent: #3b82f6; /* Primary CTA, links, active states */
  --color-accent-hover: #60a5fa;
  --color-accent-subtle: rgba(59, 130, 246, 0.1);

  /* === SEMANTIC === */
  --color-success: #22c55e;
  --color-success-subtle: rgba(34, 197, 94, 0.1);
  --color-warning: #f59e0b;
  --color-warning-subtle: rgba(245, 158, 11, 0.1);
  --color-error: #ef4444;
  --color-error-subtle: rgba(239, 68, 68, 0.1);
  --color-info: #3b82f6;

  /* === TYPOGRAPHY === */
  --font-sans: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;

  /* === TYPE SCALE (compact — web app rules, max --text-xl for dashboards) === */
  --text-xs: 0.75rem; /* 12px — labels, badges, metadata */
  --text-sm: 0.875rem; /* 14px — buttons, nav, captions */
  --text-base: 1rem; /* 16px — body text */
  --text-lg: 1.125rem; /* 18px — card headings */
  --text-xl: 1.25rem; /* 20px — page title (MAX for dashboard) */

  /* === SPACING (4px base unit) === */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* === RADIUS === */
  --radius-sm: 0.25rem; /* 4px — inputs, badges */
  --radius-md: 0.375rem; /* 6px — buttons, small cards */
  --radius-lg: 0.5rem; /* 8px — cards, panels */
  --radius-xl: 0.75rem; /* 12px — modals, large panels */

  /* === SHADOWS === */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.5);
  --shadow-inset: inset 0 1px 0 rgba(255, 255, 255, 0.04);

  /* === TRANSITIONS === */
  --transition-fast: 100ms cubic-bezier(0.16, 1, 0.3, 1);
  --transition-base: 150ms cubic-bezier(0.16, 1, 0.3, 1);
  --transition-slow: 250ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Light mode override */
[data-theme='light'] {
  --color-bg: #ffffff;
  --color-surface: #fafafa;
  --color-surface-2: #f4f4f5;
  --color-surface-hover: #f0f0f0;
  --color-border: #e4e4e7;
  --color-border-strong: #d1d1d6;
  --color-text: #09090b;
  --color-text-muted: #71717a;
  --color-text-faint: #a1a1aa;
  --color-text-inverse: #ffffff;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.12);
  --shadow-inset: inset 0 1px 0 rgba(0, 0, 0, 0.04);
}
```

---

## PHASE 2 — Base Component Styles

Create reusable base styles for the following components. **Use only design tokens — zero hardcoded color/spacing values.**

### Button

```
Variants: primary | secondary | ghost | destructive
Sizes: sm | md | lg
States: default | hover | active | focus-visible | disabled | loading

Rules:
- Height: sm=32px, md=36px, lg=40px
- Border-radius: var(--radius-md)
- Font: var(--text-sm), font-weight: 500
- Primary: bg=var(--color-accent), text=white, NO gradient
- Secondary: border=1px solid var(--color-border), bg=var(--color-surface-2)
- Ghost: no border, no bg, text only
- Destructive: bg=var(--color-error) on hover, text=white
- Focus ring: 2px solid var(--color-accent), offset 2px
- Loading state: replace text with spinner, keep button width stable (min-width)
```

### Input / Select / Textarea

```
Height: 36px (inputs), auto (textarea)
Border: 1px solid var(--color-border)
Border-radius: var(--radius-md)
Background: var(--color-surface)
Font-size: var(--text-sm)
States:
  - focus: border-color=var(--color-accent), box-shadow=0 0 0 3px var(--color-accent-subtle)
  - error: border-color=var(--color-error), box-shadow=0 0 0 3px var(--color-error-subtle)
  - disabled: opacity 0.5, cursor not-allowed
```

### Card

```
Background: var(--color-surface)
Border: 1px solid var(--color-border)
Border-radius: var(--radius-lg)
Padding: var(--space-5) var(--space-6)
Shadow: var(--shadow-sm)

NEVER use colored left borders for status — use a badge or dot instead.
If clickable:
  - hover: border-color=var(--color-border-strong), shadow=var(--shadow-md)
  - transition: var(--transition-base)
```

### Badge / Status Chip

```
Font: var(--text-xs), font-weight: 500, letter-spacing: 0.02em
Padding: 2px var(--space-2)
Border-radius: var(--radius-sm)

Variants (background → text):
  - default:  var(--color-surface-2) → var(--color-text-muted)
  - success:  var(--color-success-subtle) → var(--color-success)
  - warning:  var(--color-warning-subtle) → var(--color-warning)
  - error:    var(--color-error-subtle) → var(--color-error)
  - info:     var(--color-accent-subtle) → var(--color-accent)
```

### Table

```
Font: var(--text-sm)
Header: color=var(--color-text-muted), font-weight: 500
        border-bottom: 1px solid var(--color-border)
Row hover: background=var(--color-surface-hover), transition=var(--transition-fast)
Cell padding: var(--space-3) var(--space-4)
Number columns: font-variant-numeric: tabular-nums lining-nums; font-family: var(--font-mono)
Sticky header: required for tables with more than 10 rows
```

### Sidebar Navigation

```
Width: 240px (expanded), 56px (collapsed)
Background: var(--color-surface)
Border-right: 1px solid var(--color-border)

Nav item:
  - Height: 36px
  - Padding: 0 var(--space-3)
  - Border-radius: var(--radius-md)
  - Default: color=var(--color-text-muted), icon color=var(--color-text-muted)
  - Active: bg=var(--color-accent-subtle), color=var(--color-accent), icon=var(--color-accent)
  - Hover: bg=var(--color-surface-2)

Icon size: 16px
Section labels: var(--text-xs), uppercase, letter-spacing: 0.08em, color=var(--color-text-faint)
```

### KPI / Stat Card

```
Layout (top→bottom):
  1. Title label — var(--text-xs), var(--color-text-muted), uppercase
  2. Value       — var(--text-xl), font-weight: 700, font-family: var(--font-mono)
  3. Trend       — var(--text-xs), icon + percentage
     Positive → var(--color-success)
     Negative → var(--color-error)
     Neutral  → var(--color-text-muted)
```

---

## PHASE 3 — Layout Structure

Restructure the dashboard shell layout **only if it is currently broken or non-standard.** Preserve all routing and navigation logic.

**Target layout:**

```
┌──────────────────────────────────────────────────┐
│  Topbar (56px): Logo | Breadcrumb | Search | User │
├────────────┬─────────────────────────────────────┤
│  Sidebar   │  Main Content Area                  │
│  (240px)   │  padding: var(--space-6) var(--space-8) │
│  sticky    │  max-width: 1200px, margin: 0 auto  │
│            │  ONE scroll region — main only       │
└────────────┴─────────────────────────────────────┘
```

**Rules:**

- ONLY `<main>` scrolls — sidebar and topbar are `position: sticky` or `fixed`
- No horizontal overflow on any viewport width
- Content hierarchy per page: KPI cards → charts/trends → data tables → forms
- Responsive: sidebar collapses to overlay + hamburger at `< 768px`

---

## PHASE 4 — Apply the Design System

Go component by component through `AUDIT.md`. For each component:

1. Replace hardcoded colors → use design tokens
2. Replace hardcoded spacing → use spacing tokens
3. Replace hardcoded font sizes → use type scale tokens
4. Apply correct border-radius per component size
5. Add correct transition timing
6. Fix `focus-visible` states on all interactive elements

### ⛔ DO NOT touch:

- `onClick`, `onChange`, `onSubmit` handlers
- API calls, `fetch`, `axios`, SWR, React Query, TanStack Query
- `useEffect`, `useState`, `useContext` (unless purely cosmetic, e.g. theme toggle)
- Route definitions, `<Link>` components, navigation logic
- Form validation logic
- Data transformation or business logic functions
- Backend integration (Supabase queries, auth logic, RLS)
- Environment variables, config files

---

## PHASE 5 — Micro-polish (GitHub / Vercel / Supabase details)

After all tokens are applied, add these finishing touches:

1. **Skeleton loaders** — every loading state gets an animated shimmer skeleton, not a spinner

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface-2) 25%,
    var(--color-surface-hover) 50%,
    var(--color-surface-2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}
```

2. **Empty states** — every empty list/table gets: icon + heading + description + CTA button. Never just "No items."

3. **Number animation** — KPI values animate on mount with a count-up effect (CSS `@property` counter or JS `requestAnimationFrame`)

4. **Hover rows** — table rows get a subtle background transition using `var(--transition-fast)`

5. **Mono chips** — API keys, IDs, hashes render in `font-family: var(--font-mono)` inside a `background: var(--color-surface-2)` chip with subtle border

6. **Copy to clipboard** — any mono chip gets a copy icon on hover; on click → show checkmark for 1.5s

7. **Breadcrumb** — page title section gets Vercel-style breadcrumb with `/` separators in `var(--color-text-faint)`

8. **Status dots** — replace text-only or emoji status labels with an 8px colored dot + text label

9. **Subtle dividers** — use `1px solid var(--color-border)` instead of heavy `<hr>` separators everywhere

10. **Page fade-in** — add a 150ms fade-in on route change

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.page-enter {
  animation: fadeIn var(--transition-base) ease-out;
}
```

---

## Verification Checklist

After implementation, verify every item below before marking the task complete:

- [ ] All business logic is intact — manually test every user flow
- [ ] No hardcoded hex, rgb, or raw pixel values remain in component files
- [ ] Dark / light mode toggle works across all pages
- [ ] All interactive elements have visible `focus-visible` rings
- [ ] Tables are readable at 1280px and functional at 768px
- [ ] No horizontal scroll on any page
- [ ] Empty states exist for all data-dependent views
- [ ] Loading states use skeleton shimmer, not raw spinners
- [ ] Number columns use `tabular-nums`
- [ ] Font hierarchy: `--text-xl` max for headings, `--text-base` for body, `--text-sm` for UI chrome
- [ ] All spacing derived from 4px spacing scale only
- [ ] No colored left/side borders on cards
- [ ] Breadcrumbs present on nested pages
- [ ] KPI cards animate on mount

> ⚠️ If business logic breaks at any step — **STOP and `git revert` only that file.** Do not proceed until logic is fully restored.

---

_Prompt crafted for Cursor IDE — Dashboard Design System (GitHub / Vercel / Supabase aesthetic)_
