# User Flows

This document maps the main user flows from `docs/SPEC.md` to the current repository state.

Legend:
- `Implemented now` means the route or guard exists in `src/app` or `src/features`.
- `Specified next` means the flow is defined in `SPEC` or supported by schema/data helpers, but the final UI or route is not yet fully implemented.

## Current route coverage

### Implemented now

- `/{locale}`
- `/{locale}/sign-in`
- `/{locale}/sign-up` -> redirects to sign-in
- `/{locale}/sign-out`
- `/{locale}/m/onboarding`
- `/{locale}/m/dashboard`
- `/{locale}/m/introduce`
- `/{locale}/m/2fa-required`
- `/{locale}/admin`
- `/{locale}/directory`
- `/{locale}/verify-card`
- `/{locale}/legal/terms`
- `/{locale}/legal/privacy`
- `/{locale}/legal/cookie`
- `/{locale}/legal/contact`

### Specified next

- `/{locale}/directory/[slug]`
- `/{locale}/verify-card/[number]`
- `/{locale}/admin/users`
- `/{locale}/admin/businesses`
- `/{locale}/admin/introductions`
- `/{locale}/admin/cards`
- `/{locale}/admin/categories`
- `/{locale}/admin/countries`
- `/{locale}/admin/stripe-links`
- `/{locale}/admin/subscriptions`
- `/{locale}/admin/audit`
- `/{locale}/legal/refund`
- `/{locale}/legal/rules/club`
- `/{locale}/legal/rules/partner`
- `/{locale}/legal/rules/introduction`
- `/{locale}/legal/disclaimer`

## 1. Guest acquisition flow

Status: partially implemented now.

```mermaid
flowchart TD
  A["Guest opens /{locale}"] --> B["Reads hero, stats, top partners, how it works"]
  B --> C{"Intent"}
  C --> D["Get Card"]
  C --> E["Become VIP Member"]
  C --> F["Submit Business"]
  C --> G["Browse Directory"]
  C --> H["Verify Card"]

  D --> I["/{locale}/sign-up"]
  E --> I
  I --> J["Redirect to /{locale}/sign-in"]
  F --> G
  G --> K["/{locale}/directory"]
  H --> L["/{locale}/verify-card"]
```

Notes:
- The three primary actions are already wired from the home page.
- `Get Card` and `Become VIP Member` currently funnel into auth first.
- `Submit Business` currently leads into discovery, not a dedicated business submission flow yet.

## 2. Auth and onboarding flow

Status: implemented now.

```mermaid
flowchart TD
  A["User opens /{locale}/sign-in"] --> B["Phone OTP form"]
  B --> C{"OTP verified?"}
  C -- "No" --> B
  C -- "Yes" --> D["syncAuthUser()"]
  D --> E{"New user?"}
  E -- "Yes" --> F["Redirect to /{locale}/m/onboarding"]
  E -- "No" --> G["Redirect to /{locale}/m/dashboard"]
  F --> H["Complete profile: displayName, country, city, bio"]
  H --> I["Profile row created"]
  I --> G
```

Notes:
- `/{locale}/sign-up` is intentionally a redirect into `/{locale}/sign-in`.
- Auth creates or syncs the app user record.
- Onboarding completion is determined by the existence of a profile row.

## 3. Member dashboard flow

Status: guard implemented now, final dashboard sections specified next.

```mermaid
flowchart TD
  A["User requests /{locale}/m/dashboard"] --> B{"Authenticated?"}
  B -- "No" --> C["Redirect to /{locale}/sign-in"]
  B -- "Yes" --> D{"Onboarding complete?"}
  D -- "No" --> E["Redirect to /{locale}/m/onboarding"]
  D -- "Yes" --> F["Dashboard"]

  F --> G{"Role / entitlement"}
  G --> H["FREE: card, profile, directory, upgrade CTA"]
  G --> I["VIP: FREE features + Business Introduction + subscription"]
  G --> J["BUSINESS: profile + business status + introduction access"]
  G --> K["ADMIN: admin entry guarded by MFA"]
```

Notes:
- The route exists and is protected.
- The page body is still a placeholder, but the role-based product model is already defined in `SPEC`.

## 4. Business Introduction flow

Status: access rules implemented now, full workflow specified next.

```mermaid
flowchart TD
  A["User requests /{locale}/m/introduce"] --> B{"Authenticated?"}
  B -- "No" --> C["Redirect to sign-in"]
  B -- "Yes" --> D{"BUSINESS or ADMIN?"}
  D -- "No" --> E["Redirect to /{locale}/m/dashboard"]
  D -- "Yes" --> F{"Onboarding complete?"}
  F -- "No" --> G["Redirect to onboarding"]
  F -- "Yes" --> H["Business Introduction page"]

  H --> I["Submit introduction request"]
  I --> J["Record created with status SUBMITTED"]
  J --> K["Admin review"]
  K --> L["APPROVED / REJECTED / next lifecycle status"]
```

Notes:
- The route and guards already exist.
- The `introductions` table already exists, so the workflow has a data model foundation.
- `SPEC` says this flow is admin-mediated.

## 5. Admin access and MFA flow

Status: implemented now for root admin access.

```mermaid
flowchart TD
  A["User requests /{locale}/admin"] --> B{"Authenticated?"}
  B -- "No" --> C["Redirect to /{locale}/sign-in"]
  B -- "Yes" --> D{"role = ADMIN?"}
  D -- "No" --> E["Redirect to /{locale}/"]
  D -- "Yes" --> F{"Verified MFA in active session?"}
  F -- "No" --> G["Redirect to /{locale}/m/2fa-required"]
  F -- "Yes" --> H["Admin dashboard"]
```

Companion protected-session contract:

```mermaid
flowchart TD
  A["GET /api/protected/admin-session"] --> B{"Authenticated admin?"}
  B -- "No auth" --> C["401 UNAUTHORIZED"]
  B -- "Wrong role" --> D["403 FORBIDDEN"]
  B -- "Admin without MFA" --> E["403 MFA_REQUIRED"]
  B -- "Admin with MFA" --> F["200 ok: true"]
```

Notes:
- This is the cleanest fully enforced flow in the repo right now.
- The child admin sections from `SPEC` are not yet routed in `src/app`.

## 6. Public directory flow

Status: route implemented now, data helpers implemented now, final list/detail UI specified next.

```mermaid
flowchart TD
  A["Guest opens /{locale}/directory"] --> B["See published businesses"]
  B --> C["Filter by country / category / search"]
  C --> D["Open business detail"]
  D --> E["See public business info"]
  E --> F["Sign in for richer member-only context"]
```

Notes:
- The route currently renders a placeholder page.
- The data helper already restricts the list to `PUBLISHED` businesses.
- The slug detail route is still missing from `src/app`, but a helper already exists for it.

## 7. Verify card flow

Status: lookup entry route implemented now, final number route specified next.

```mermaid
flowchart TD
  A["Guest opens /{locale}/verify-card"] --> B["Enter card number or arrive from QR"]
  B --> C["/{locale}/verify-card/[number]"]
  C --> D["Load public card DTO only"]
  D --> E["Show number, memberName, memberType, status, expiresAt"]
```

Notes:
- The lookup page exists and is marked `robots: noindex`.
- The per-card public route described in `SPEC` is not yet present in `src/app`.
- The `club_cards` schema is already in place.

## 8. Billing lifecycle flow

Status: specified in `SPEC`, not yet fully implemented in routed UI.

```mermaid
flowchart TD
  A["Authenticated member opens dashboard"] --> B["Clicks VIP upgrade CTA"]
  B --> C["External Stripe Payment Link"]
  C --> D["Stripe webhook updates app state"]
  D --> E["Dashboard reflects VIP access"]
  E --> F["Member can cancel from dashboard"]
  F --> G["VIP remains active until period end"]
```

Notes:
- The product contract is clear in `SPEC`.
- The UI and route-level flow still need to be completed in the app.

## 9. Role summary map

```mermaid
flowchart LR
  A["Guest"] --> B["Sign in"]
  B --> C["FREE"]
  C --> D["Onboarding complete"]
  D --> E["Dashboard access"]
  E --> F["Upgrade to VIP"]
  E --> G["Apply / manage business profile"]
  F --> H["VIP"]
  G --> I["BUSINESS"]
  H --> J["Business Introduction access"]
  I --> J
  J --> K["Admin-mediated lifecycle"]
  E --> L["If role = ADMIN"]
  L --> M["MFA required"]
  M --> N["Admin area"]
```

## 10. Repo reality summary

- The authentication and access-control backbone is already present.
- The onboarding flow is the most complete end-to-end user flow in the repo today.
- The admin entry flow with MFA is also concretely implemented.
- The directory, verify-card, dashboard, introduction, and admin content surfaces are still moving from placeholder or schema-backed state into full product pages.
