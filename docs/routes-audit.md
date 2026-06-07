# KCLUB Routes Audit

Last refreshed: 2026-06-06.

This audit reflects the current `src/app` shape. Older versions of this file
reported missing `robots.txt` and `sitemap.xml`; both are now implemented through
Next metadata routes.

## Summary

| Area                   | Status                               | Notes                                                                                                                                |
| ---------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Public localized shell | Implemented                          | `/{locale}`, directory, verify-card, and legal routes exist.                                                                         |
| Auth                   | Implemented                          | Phone-first Supabase Auth screens exist for sign-in/sign-up/sign-out.                                                                |
| Member area            | Implemented with remaining QA        | Dashboard, onboarding, introduce, subscription, business submission, and checkout result pages exist.                                |
| Admin                  | Implemented with expanded operations | Users, businesses, cards, introductions, memberships, roles/access, references, catalog, audit, exports, and billing surfaces exist. |
| System routes          | Implemented                          | `src/app/robots.ts`, `src/app/sitemap.ts`, and Stripe webhook route exist.                                                           |

## Public Routes

| Route                            | Filesystem                                       | Status                                                                               |
| -------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `/{locale}`                      | `src/app/[locale]/page.tsx`                      | Implemented                                                                          |
| `/{locale}/directory`            | `src/app/[locale]/directory/page.tsx`            | Implemented                                                                          |
| `/{locale}/directory/[slug]`     | `src/app/[locale]/directory/[slug]/page.tsx`     | Implemented                                                                          |
| `/{locale}/verify-card`          | `src/app/[locale]/verify-card/page.tsx`          | Implemented lookup entry; redirects card numbers to `/{locale}/verify-card/[number]` |
| `/{locale}/verify-card/[number]` | `src/app/[locale]/verify-card/[number]/page.tsx` | Implemented; PII-safe DTO coverage exists                                            |

## Member Routes

| Route                          | Filesystem                                     | Status      |
| ------------------------------ | ---------------------------------------------- | ----------- |
| `/{locale}/m/dashboard`        | `src/app/[locale]/m/dashboard/page.tsx`        | Implemented |
| `/{locale}/m/onboarding`       | `src/app/[locale]/m/onboarding/page.tsx`       | Implemented |
| `/{locale}/m/introduce`        | `src/app/[locale]/m/introduce/page.tsx`        | Implemented |
| `/{locale}/m/subscription`     | `src/app/[locale]/m/subscription/page.tsx`     | Implemented |
| `/{locale}/m/business/new`     | `src/app/[locale]/m/business/new/page.tsx`     | Implemented |
| `/{locale}/m/checkout/success` | `src/app/[locale]/m/checkout/success/page.tsx` | Implemented |
| `/{locale}/m/checkout/cancel`  | `src/app/[locale]/m/checkout/cancel/page.tsx`  | Implemented |
| `/{locale}/m/2fa-required`     | `src/app/[locale]/m/2fa-required/page.tsx`     | Implemented |

## Admin Routes

| Route group           | Filesystem                                                               | Status      |
| --------------------- | ------------------------------------------------------------------------ | ----------- |
| Admin home/profile    | `src/app/[locale]/admin/`, `admin/profile/`                              | Implemented |
| Users and access      | `admin/users/`, `admin/access/`, `admin/roles/`                          | Implemented |
| Businesses/catalog    | `admin/businesses/`, `admin/catalog/`                                    | Implemented |
| Cards and memberships | `admin/cards/`, `admin/memberships/`                                     | Implemented |
| Introductions         | `admin/introductions/`                                                   | Implemented |
| Billing operations    | `admin/stripe-links/`, `admin/subscriptions/`                            | Implemented |
| References and audit  | `admin/categories/`, `admin/countries/`, `admin/cities/`, `admin/audit/` | Implemented |

## System Routes

| Route                          | Filesystem                                     | Status      |
| ------------------------------ | ---------------------------------------------- | ----------- |
| `/robots.txt`                  | `src/app/robots.ts`                            | Implemented |
| `/sitemap.xml`                 | `src/app/sitemap.ts`                           | Implemented |
| `/api/stripe/webhook`          | `src/app/api/stripe/webhook/route.ts`          | Implemented |
| `/api/admin/users/export`      | `src/app/api/admin/users/export/route.ts`      | Implemented |
| `/api/admin/businesses/export` | `src/app/api/admin/businesses/export/route.ts` | Implemented |

## Remaining Route QA

- Add remaining persona-based E2E for positive admin, VIP/BUS, business, and
  Business Introduction workflows.
- Keep unauthenticated admin/member redirect smoke separate from positive
  persona smoke.
- Keep public DTO and PII key-set assertions in contract tests.
