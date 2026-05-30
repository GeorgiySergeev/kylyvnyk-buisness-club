# AUDIT.md — Design System Audit (Phase 0)

> **Generated**: 2026-05-30  
> **Purpose**: Comprehensive audit of all existing UI components, color values, typography, spacing, CSS files, and third-party UI libraries. This document MUST be completed before any Phase 1 redesign work begins.

---

## 1. Component Inventory

### 1.1 Layout Components

| Component | File | Notes |
|---|---|---|
| `AppShell` | [`app-shell.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/layout/app-shell.tsx) | Root shell: header → main → dev-menu → footer. RSC. |
| `PageWrapper` | [`page-wrapper.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/layout/page-wrapper.tsx) | Container with `kc-container` + optional `pt-10 md:pt-16`. |
| `PublicChromeGate` | [`public-chrome-gate.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/layout/public-chrome-gate.tsx) | Client component — hides header/footer on admin routes. |
| `SiteFooter` | [`site-footer.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/layout/site-footer.tsx) | Full-width footer with 3-column grid, newsletter input. RSC. |
| `PlaceholderPage` | [`placeholder-page.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/layout/placeholder-page.tsx) | Generic "coming soon" page skeleton. RSC. |
| `RootLayout` | [`layout.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/app/layout.tsx) | HTML root with fonts (Oxanium, Playfair, JetBrains Mono). |
| `AdminHeader` | [`admin-header.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/admin-header.tsx) | Top bar for admin: breadcrumb, search, avatar, notifications. |
| `AdminSidebarInner` | [`admin-sidebar.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/admin-sidebar.tsx) | Sidebar nav with icon-labeled links, avatar footer. |
| `AdminMobileNav` | [`admin-mobile-nav.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/admin-mobile-nav.tsx) | Mobile hamburger navigation for admin. |

### 1.2 Navigation

| Component | File | Notes |
|---|---|---|
| `HomeHeader` | [`home-header.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/home/home-header.tsx) | Sticky header with logo, nav, locale switcher, avatar. Client component. |
| `LocaleSwitcher` | [`locale-switcher.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/home/locale-switcher.tsx) | EN/RU/UK language toggle. Client component. |
| `MobileBottomNav` | [`mobile-bottom-nav.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/home/mobile-bottom-nav.tsx) | Fixed bottom nav for mobile (Crown, Grid3x3, User icons). |
| `DevRouteMenu` | [`dev-route-menu.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/dev/dev-route-menu.tsx) | Dev-only floating FAB with all routes. |
| `navigation.ts` | [`navigation.ts`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/layout/navigation.ts) | Navigation config (PRIMARY_NAV, GUEST_AUTH, MEMBER_AUTH). |
| `admin-nav.ts` | [`admin-nav.ts`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/admin-nav.ts) | Admin navigation items config. |

### 1.3 Data Display Components

| Component | File | Notes |
|---|---|---|
| `DashboardPageHeader` | [`dashboard-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/member/dashboard-ui.tsx#L26-L45) | Centered hero with eyebrow + title + description. |
| `DashboardPanel` | [`dashboard-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/member/dashboard-ui.tsx#L47-L59) | Card-like section with header/body. |
| `DashboardProfileHero` | [`dashboard-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/member/dashboard-ui.tsx#L143-L168) | Avatar + name + tier badge. |
| `DashboardTabPanel` | [`dashboard-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/member/dashboard-ui.tsx#L178-L210) | Tabbed content panel (embedded or standalone). |
| `DashboardSettingsRow` | [`dashboard-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/member/dashboard-ui.tsx#L218-L228) | Key-value row with optional action. |
| `DashboardIntroductionsBlock` | [`dashboard-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/member/dashboard-ui.tsx#L82-L124) | Introductions KPI with count + CTA. |
| `DashboardIntroductionPanel` | [`dashboard-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/member/dashboard-ui.tsx#L268-L289) | Introductions count card. |
| `DashboardEmptyState` | [`dashboard-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/member/dashboard-ui.tsx#L126-L133) | Empty state with title + description. |
| `DashboardDangerZone` | [`dashboard-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/member/dashboard-ui.tsx#L237-L258) | Destructive action block with alert icon. |
| `DashboardQuickLink` | [`dashboard-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/member/dashboard-ui.tsx#L61-L71) | Arrow link for navigation. |
| `HeroSection` | [`hero-section.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/home/hero-section.tsx) | Home page hero with 3-column tier cards. |
| `StatsSection` | [`stats-section.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/home/stats-section.tsx) | 3-column KPI counters. |
| `StatsCounter` | [`stats-counter.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/home/stats-counter.tsx) | Animated count-up on intersection. Client component. |
| `HowItWorksSection` | [`how-it-works-section.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/home/how-it-works-section.tsx) | 3-step ordered list. |
| `FindPartnerSection` | [`find-partner-section.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/home/find-partner-section.tsx) | Filter bar with 3 filters + search CTA. |
| `TopPartnersSection` | [`top-partners-section.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/home/top-partners-section.tsx) | Partner cards slider with "view all" CTA. RSC. |
| `TopPartnersSlider` | [`top-partners-slider.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/home/top-partners-slider.tsx) | Client-side slider for partner cards. |
| `RecommendedSection` | [`recommended-section.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/home/recommended-section.tsx) | 3-column recommended partners grid. RSC. |
| `PremiumPartnerCard` | [`premium-partner-card.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/partners/premium-partner-card.tsx) | Partner card with image, location, category badges. |
| `ClubCard` | [`club-card.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/member/club-card.tsx) | Digital membership card with QR code. Client component. |
| `ClubCardPlaceholder` | [`club-card.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/member/club-card.tsx#L75-L86) | Dashed placeholder for missing card. |
| `AdminMetricCard` | [`admin-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/admin-ui.tsx#L59-L93) | KPI card with label/value/tone. |
| `AdminPanel` | [`admin-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/admin-ui.tsx#L95-L117) | Card wrapper for admin content. |
| `AdminDataTableShell` | [`admin-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/admin-ui.tsx#L161-L165) | Bordered wrapper for data tables. |
| `AdminMobileCard` | [`admin-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/admin-ui.tsx#L181-L231) | Mobile-optimized data card. |
| `AdminDescriptionList` | [`admin-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/admin-ui.tsx#L242-L259) | 2-column DL grid. |
| `AdminEmptyState` | [`admin-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/admin-ui.tsx#L233-L240) | Dashed border empty state. |
| `AdminPageHeader` | [`admin-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/admin-ui.tsx#L30-L57) | Page title with eyebrow + description + actions. |

### 1.4 Form Components

| Component | File | Notes |
|---|---|---|
| `PhoneAuthForm` | [`phone-auth-form.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/auth/components/phone-auth-form.tsx) | Phone OTP auth form. Client component. |
| `OnboardingForm` | [`onboarding-form.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/auth/components/onboarding-form.tsx) | Multi-field onboarding. Client component. |
| `IntroductionForm` | [`introduction-form.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/introductions/components/introduction-form.tsx) | Business introduction request form. |
| `IntroductionModerationForm` | [`introduction-moderation-form.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/introductions/components/introduction-moderation-form.tsx) | Admin moderation form. |
| `DashboardProfileSettingsForm` | [`dashboard-profile-settings-form.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/profile/components/dashboard-profile-settings-form.tsx) | Profile editing form. |
| `SubmitBusinessForm` | [`submit-business-form.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/business/components/submit-business-form.tsx) | Business submission form. |
| `UserContactForm` | [`user-contact-form.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/user-contact-form.tsx) | Admin user contact editing. |
| `UserPersonalInfoForm` | [`user-personal-info-form.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/user-personal-info-form.tsx) | Admin personal info editing. |
| `UserCrudForm` | [`user-crud-form.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/user-crud-form.tsx) | Admin user CRUD form. |
| `UserRoleForm` | [`user-role-form.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/user-role-form.tsx) | Role assignment form. |
| `CardUpdateForm` | [`card-update-form.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/card-update-form.tsx) | Card status update form. |
| `BusinessStatusForm` | [`business-status-form.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/business-status-form.tsx) | Business status change form. |
| `RoleForm` | [`role-form.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/roles/components/role-form.tsx) | Role creation/editing. |
| `RolePermissionEditor` | [`role-permission-editor.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/roles/components/role-permission-editor.tsx) | Checkbox matrix for permissions. |
| `UsersFilters` | [`users-filters.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/users-filters.tsx) | Admin users search + filters bar. |
| `TurnstileWidget` | [`turnstile-widget.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/auth/components/turnstile-widget.tsx) | Cloudflare Turnstile captcha. |

### 1.5 Modals / Dialogs

| Component | File | Notes |
|---|---|---|
| `Dialog` (shadcn) | [`dialog.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/dialog.tsx) | Radix Dialog with overlay, close button. |
| `CancelVipButton` | [`cancel-vip-button.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/billing/components/cancel-vip-button.tsx) | Confirmation dialog for VIP cancellation. |
| `UserDangerZone` | [`user-danger-zone.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/user-danger-zone.tsx) | Dialog-based destructive actions. |

### 1.6 Primitive / UI Kit Components (shadcn/ui)

| Component | File |
|---|---|
| `Button` | [`button.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/button.tsx) |
| `Card` / `CardHeader` / `CardTitle` / etc. | [`card.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/card.tsx) |
| `Badge` | [`badge.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/badge.tsx) |
| `Input` | [`input.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/input.tsx) |
| `Textarea` | [`textarea.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/textarea.tsx) |
| `Select` / `SelectTrigger` / etc. | [`select.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/select.tsx) |
| `Table` / `TableRow` / `TableHead` / etc. | [`table.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/table.tsx) |
| `Avatar` / `AvatarImage` / `AvatarFallback` / etc. | [`avatar.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/avatar.tsx) |
| `Dialog` / `DialogContent` / `DialogTitle` / etc. | [`dialog.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/dialog.tsx) |
| `DropdownMenu` / `DropdownMenuItem` / etc. | [`dropdown-menu.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/dropdown-menu.tsx) |
| `Checkbox` | [`checkbox.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/checkbox.tsx) |
| `Label` | [`label.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/label.tsx) |
| `Separator` | [`separator.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/separator.tsx) |
| `Skeleton` | [`skeleton.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/skeleton.tsx) |
| `ToggleGroup` / `ToggleGroupItem` | [`toggle-group.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/toggle-group.tsx) |
| `CountryFlag` | [`country-flag.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/ui/country-flag.tsx) |

### 1.7 Error / State Components

| Component | File | Notes |
|---|---|---|
| `ErrorFallback` | [`error-fallback.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/components/error/error-fallback.tsx) | Client-side error boundary UI. |
| `AdminStatusBadge` | [`admin-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/admin-ui.tsx#L167-L179) | Status badge with color tones. |
| `AdminFiltersBar` | [`admin-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/admin-ui.tsx#L119-L136) | Filters container. |
| `AdminSearchInput` | [`admin-ui.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/admin/components/admin-ui.tsx#L138-L159) | Search input with icon. |

### 1.8 Billing Components

| Component | File |
|---|---|
| `VipUpgradePanel` | [`vip-upgrade-panel.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/billing/components/vip-upgrade-panel.tsx) |
| `BillingPortalButton` | [`billing-portal-button.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/billing/components/billing-portal-button.tsx) |
| `CancelVipButton` | [`cancel-vip-button.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/billing/components/cancel-vip-button.tsx) |

### 1.9 Auth Components

| Component | File |
|---|---|
| `AuthPageHeader` | [`auth-page-header.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/auth/components/auth-page-header.tsx) |
| `AuthAlternateLink` | [`auth-alternate-link.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/auth/components/auth-alternate-link.tsx) |
| `SignOutPanel` | [`sign-out-panel.tsx`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/features/auth/components/sign-out-panel.tsx) |

---

## 2. Color Values Currently in Use

### 2.1 DaisyUI Custom Theme (`kclub`)

| Token | Hex Value | Usage |
|---|---|---|
| `--color-base-100` | `#0a0a0b` | Page background |
| `--color-base-200` | `#16161a` | Card / elevated bg |
| `--color-base-300` | `#1f1f25` | Tertiary surface |
| `--color-base-content` | `#f5f5f0` | Main text |
| `--color-primary` | `#d4af37` | Gold primary accent |
| `--color-primary-content` | `#0a0a0b` | Text on primary |
| `--color-secondary` | `#1f1f25` | Secondary bg |
| `--color-secondary-content` | `#f5f5f0` | Text on secondary |
| `--color-accent` | `#e6c14a` | Accent gold |
| `--color-accent-content` | `#0a0a0b` | Text on accent |
| `--color-neutral` | `#16161a` | Neutral bg |
| `--color-neutral-content` | `#f5f5f0` | Text on neutral |
| `--color-info` | `oklch(0.715 0.143 215.221)` | Info blue |
| `--color-success` | `#22c55e` | Success green |
| `--color-warning` | `oklch(0.769 0.188 70.08)` | Warning amber |
| `--color-error` | `#ef4444` | Error red |
| `--color-error-content` | `#f5f5f0` | Text on error |

### 2.2 `:root` CSS Custom Properties (shadcn defaults)

| Token | Value | Notes |
|---|---|---|
| `--background` | `oklch(14.1% 0.005 285.823)` | ~dark zinc |
| `--foreground` | `oklch(98.5% 0 0)` | ~near white |
| `--card` | `#1a1a1a1a` | Transparent dark (8-digit hex with alpha!) |
| `--popover` | `oklch(1 0 0)` | White |
| `--primary` | `oklch(98.5% 0 0)` | ~near white (conflicts with daisyUI gold primary) |
| `--primary-foreground` | `oklch(0.985 0 0)` | Same as primary (likely a bug) |
| `--secondary` | `oklch(0.967 0.001 286.375)` | Light zinc |
| `--muted` | `oklch(0.967 0.001 286.375)` | Same as secondary |
| `--muted-foreground` | `oklch(0.552 0.016 285.938)` | Mid-gray |
| `--accent` | `oklch(0.967 0.001 286.375)` | Same as secondary/muted |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Red |
| `--destructive-foreground` | `#f5f5f0` | Light text on red |
| `--border` | `oklch(0.92 0.004 286.32/10%)` | Very subtle border |
| `--input` | `oklch(0.92 0.004 286.32)` | Input border |
| `--ring` | `oklch(0.705 0.015 286.067)` | Focus ring |
| `--success` | `#22c55e` | Green (custom addition) |
| `--accent-hover` | `#e6c14a` | Gold hover (custom) |

### 2.3 Fintech / Brand Colors (custom)

| Token | Hex Value | Usage |
|---|---|---|
| `--fintech-gold` | `#ffd700` | Pure gold |
| `--fintech-soft-gold` | `#c9a84c` | Muted gold |
| `--fintech-bg` | `#1a1a1a` | Dark background |
| `--fintech-black` | `#000000` | Pure black |
| `--fintech-charcoal` | `#333333` | Charcoal gray |
| `--fintech-glow` | `rgb(255 215 0 / 20%)` | Gold glow effect |

### 2.4 `.admin` Scope Colors

| Token | Value |
|---|---|
| `--background` | `#070707` |
| `--foreground` | `#f5f5f2` |
| `--card` | `#171717` |
| `--popover` | `#1d1d1d` |
| `--primary` | `#d4af37` |
| `--primary-foreground` | `#090909` |
| `--secondary` | `#242424` |
| `--muted` | `#242424` |
| `--muted-foreground` | `#a3a3a3` |
| `--accent` | `#242424` |
| `--destructive` | `#ef4444` |
| `--border` | `rgb(255 255 255 / 10%)` |
| `--input` | `rgb(255 255 255 / 14%)` |
| `--ring` | `#8b8b8b` |
| `--sidebar` | `#171717` |
| `--sidebar-primary` | `#d4af37` |
| `--sidebar-accent` | `#262626` |

### 2.5 `.dark` Mode Colors (shadcn)

All `oklch(...)` values — standard shadcn dark theme overrides.

### 2.6 Hardcoded Colors in Component Files

| File | Value | Context |
|---|---|---|
| `club-card.tsx` | `#ffffff`, `#000000` | QRCode bgColor/fgColor props |
| `admin-ui.tsx` | `text-red-300`, `text-emerald-300`, `text-amber-300`, `text-blue-300` | Status tone classes (Tailwind named colors, NOT tokens) |
| `admin-ui.tsx` | `border-red-500/25`, `bg-red-500/10`, etc. | Status tone border/bg classes |
| `admin-header.tsx` | `bg-red-500` | Notification dot |
| `admin-header.tsx` | `fill-emerald-400`, `text-emerald-400` | Operational status dot |

### 2.7 Inline Color References in Tailwind Classes (common patterns)

- `text-white` — used extensively across all components
- `text-fg/50`, `text-fg/45`, `text-fg/35`, `text-fg/60`, `text-fg/30` — opacity modifiers on foreground
- `bg-white/2`, `bg-white/4`, `bg-white/5`, `bg-black/60`, `bg-black/70`, `bg-black/90`, `bg-black/95`
- `border-border/50` — the most common border pattern
- `text-primary`, `bg-primary`, `text-primary-foreground` — gold accent via token
- `text-muted-foreground` — secondary text everywhere
- `bg-card`, `bg-card/95`, `bg-card/70`, `bg-card/30` — card backgrounds with varying opacity

---

## 3. Typography

### 3.1 Font Families

| Variable | Font | Used For |
|---|---|---|
| `--font-sans` | **Oxanium** (Google Fonts) | Body text, headings, buttons, nav |
| `--font-display` | **Playfair Display** + Arial fallback | Placeholder page headings |
| `--font-mono` | **JetBrains Mono** + Consolas fallback | Card numbers, code |
| `--font-heading` | = `var(--font-sans)` | Card titles (alias) |

### 3.2 Font Sizes in Use

| Tailwind Class | Pixel | Where Used |
|---|---|---|
| `text-[10px]` | 10px | Tracking labels, country codes, badge text, bottom nav labels |
| `text-[11px]` | 11px | Eyebrow text, status labels, admin nav labels, footer copyright |
| `text-xs` | 12px | Labels, badges, metadata, avatar fallback, tier badge |
| `text-sm` | 14px | Body text, buttons, nav links, card descriptions, inputs |
| `text-[15px]` | 15px | Slightly larger body text in some sections |
| `text-base` | 16px | Card titles, heading level 2/3, dialog title, inputs (mobile) |
| `text-lg` | 18px | Partner card name, section headings, card numbers |
| `text-xl` | 20px | Card numbers (sm breakpoint) |
| `text-2xl` | 24px | Dashboard title, hero sub-heading, admin metric values |
| `text-3xl` | 30px | Section headings, stat counter values, dashboard page header |
| `text-4xl` | 36px | Stat counters (sm), hero title (sm), dashboard intro count |
| `text-5xl` | 48px | Stat counters (md), placeholder title (sm) |
| `text-[2.75rem]` | 44px | Section heading (md breakpoint) |
| `text-[3.25rem]` | 52px | Hero title (md breakpoint) |

### 3.3 Font Weights

| Weight | Tailwind | Usage |
|---|---|---|
| 400 (normal) | `font-normal` | Eyebrow text |
| 500 (medium) | `font-medium` | Labels, button text, card titles, nav active |
| 600 (semibold) | `font-semibold` | Section headings, footer links, nav logo, partner names |
| 700 (bold) | `font-bold` | Page titles, stats values, hero title, dashboard title |

---

## 4. Spacing Values

### 4.1 CSS Custom Properties

| Token | Value | Usage |
|---|---|---|
| `--kc-header-h` | `4.5rem` (72px) | Header height |
| `--kc-max-w` | `80rem` (1280px) | Max content width |
| `--kc-gutter` | `clamp(1rem, 4vw, 2.5rem)` | Inline padding |
| `--radius` | `0.45rem` | Base border radius |

### 4.2 Common Padding/Margin Patterns (Tailwind)

| Value | Where |
|---|---|
| `p-1`, `p-1.5` | QR code, checkbox indicator, dropdown items |
| `p-2` | Badge, small cards, dropdown content |
| `p-3` | Admin cards, mobile cards, filters bar |
| `p-4` | Card (default), dialog, admin panels, footer sections |
| `p-5` | Dashboard panels, admin danger zone |
| `p-6` | Sections, hero tiers, dashboard content, footer nav |
| `p-8` | Larger sections, placeholder pages, dashboard profile |
| `px-2.5` | Input, button default |
| `px-3` | Nav items, button small |
| `px-4` | Cards, sections |
| `px-6` | Section containers |
| `px-8` | Section containers (sm) |
| `px-10` | Section containers (md) |
| `py-2` | Header nav row |
| `py-5` | Admin card header, settings rows |
| `py-6` | Section rows, dashboard panels |
| `py-8` | Section rows, dashboard profile hero |
| `py-10` | Section rows (sm) |
| `py-12` | Section rows (md) |
| `py-16` | Sections |
| `py-20` | Sections (xs) |
| `py-24` | Sections (sm), footer |
| `py-28` | Sections (md) |

### 4.3 Gap Patterns

| Value | Where |
|---|---|
| `gap-0.5` | Mobile bottom nav icon-label |
| `gap-1` | Button groups, nav |
| `gap-1.5` | Button icon gap, avatar badge |
| `gap-2` | Header items, icon+text |
| `gap-3` | Footer nav items, admin sidebar links |
| `gap-4` | Card sections, settings row |
| `gap-5` | Footer contact items |
| `gap-6` | Dashboard sections |
| `gap-8` | Hero CTA section (sm) |

---

## 5. CSS Files and Styling Infrastructure

### 5.1 CSS Files

| File | Type | Size | Description |
|---|---|---|---|
| [`globals.css`](file:///g:/KYLYVNYK%20CLUB/kclub-mvp-V2/src/app/globals.css) | Global CSS | 11,937 B | Master stylesheet — imports, DaisyUI theme, shadcn tokens, custom utilities, animations |
| `src/styles/.gitkeep` | Empty | 2 B | Unused styles directory |

### 5.2 Styling Approaches

1. **Tailwind CSS v4** — CSS-first config via `@tailwindcss/postcss` plugin
2. **DaisyUI v5** — Custom `kclub` theme via `@plugin "daisyui/theme"` in globals.css
3. **shadcn/ui** — Radix Nova style, CSS variables, `class-variance-authority` for variants
4. **tw-animate-css** — Animation utilities for transitions
5. **Custom utility classes** in `@layer utilities`:
   - `.kc-container` — Responsive container
   - `.kc-gold-rule` — Gold gradient divider
   - `.kc-fintech-footer` — Radial gradient footer bg
   - `.kc-fintech-grid` — Subtle grid pattern overlay
   - `.kc-fintech-glow` — Gold box-shadow glow
   - `.kc-gold-glow` — Alternate gold glow
   - `.kc-fade-in` + delays — FadeInUp animations with stagger
   - `.kc-how-it-works-bg` — Diagonal striped background
6. **Custom keyframe animations**:
   - `fadeInUp` (267–276) — Opacity + translateY
   - `goldPulse` (278–286) — Pulsing gold box-shadow
7. **No inline `style` attributes** in any component files
8. **No CSS modules** in use
9. **No styled-components / Emotion**

### 5.3 Theme Scoping

| Scope | Mechanism | Purpose |
|---|---|---|
| Default `:root` | shadcn light theme vars | Base tokens (currently has light-mode defaults for some) |
| `.dark` | shadcn dark theme vars | Full dark mode override |
| `.admin` | Custom CSS class | Admin-specific dark palette with gold primary |
| DaisyUI `kclub` | `@plugin "daisyui/theme"` | Custom dark theme for DaisyUI components |

> ⚠️ **Conflict**: `:root` has `--primary: oklch(98.5% 0 0)` (near-white) but DaisyUI theme sets `--color-primary: #d4af37` (gold). The `.admin` scope resets `--primary: #d4af37`. The design intent is gold primary throughout, but the shadcn `:root` tokens don't reflect this.

---

## 6. Third-Party UI Libraries

| Library | Version | Role |
|---|---|---|
| **shadcn/ui** | `^4.8.1` | Component scaffold generator (Radix Nova style) |
| **Radix UI** (`radix-ui`) | `^1.4.3` | Headless UI primitives (Dialog, Select, DropdownMenu, Avatar, Checkbox, Separator, Label, ToggleGroup, Slot) |
| **DaisyUI** | `5.0.50` | Tailwind component plugin (theme config only; `themes: false`) |
| **class-variance-authority** (CVA) | `0.7.1` | Variant management for Button, Badge, ToggleGroup |
| **clsx** | `2.1.1` | Conditional classnames |
| **tailwind-merge** | `3.6.0` | Conflict-free class merging (via `cn()` utility) |
| **Lucide React** | `1.16.0` | Icon library |
| **tw-animate-css** | `1.4.0` | Animation utilities for shadcn |
| **qrcode.react** | `^4` | QR code generation for membership cards |
| **react-hook-form** | `7.76.0` | Form state management |
| **@hookform/resolvers** | `5.4.0` | Zod resolver for RHF |
| **zod** | `4.4.3` | Schema validation |

---

## 7. Key Observations & Risks for Redesign

### 7.1 Token System Fragmentation

The project has **three competing color systems** that partially overlap:
1. **shadcn/ui tokens** (`:root` and `.dark` — oklch values)
2. **DaisyUI theme** (`kclub` — hex values)
3. **Custom fintech tokens** (`--fintech-*` — hex values)

Components mix references freely (e.g., `text-foreground` from shadcn, `bg-fintech-black` from custom, `text-primary` resolving differently depending on scope).

### 7.2 Missing Light Mode Support

- `html` forces `color-scheme: dark`
- `.dark` class overrides exist but are vestigial from shadcn scaffold
- The `:root` tokens have light-mode defaults that conflict with the intended dark-first design
- No `data-theme='light'` toggle exists

### 7.3 Hardcoded Tailwind Colors in Admin

The admin UI uses raw Tailwind color classes (`text-red-300`, `text-emerald-300`, `text-amber-300`, `text-blue-300`, `bg-red-500`) outside the token system. These must be migrated to design tokens.

### 7.4 Card Background Transparency Issue

`:root` defines `--card: #1a1a1a1a` — an **8-digit hex** (with 10% alpha). This creates semi-transparent cards that may not be intentional in all contexts.

### 7.5 No Sidebar in Public Routes

The current layout is **topbar + full-width content** for public routes. The admin has a sidebar but public/member pages do not. PHASE 3 sidebar specifications apply to the **dashboard** area, not public pages.

### 7.6 Skeleton Component Gaps

The `Skeleton` component uses `animate-pulse` (basic) rather than the shimmer effect specified in PHASE 5. No shimmer keyframes currently exist.

### 7.7 Number Formatting

`StatsCounter` already implements a count-up animation with `requestAnimationFrame` + `IntersectionObserver`, which partially addresses PHASE 5 KPI animation requirements.

---

> ✅ **Phase 0 Complete.** This audit covers all components, colors, fonts, spacing, CSS files, and third-party libraries. Proceed to Phase 1 only after reviewing this document.
