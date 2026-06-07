# Phase 09: Product Workflow QA

Date: 2026-06-07

## Goal

Start Sprint 3 with positive browser workflows that exercise real user-facing
routes while keeping PR smoke and unauthenticated smoke separate.

## Implemented in this slice

- Replaced the `/verify-card` placeholder with a real card-number lookup entry.
- Kept the actual public data lookup on `/verify-card/[number]`, preserving the
  existing PII-safe DTO and `robots: noindex` contract.
- Added a `@regression` Playwright workflow for:
  - dev-bypass sign-up with a unique test phone,
  - onboarding skip,
  - member dashboard load.
- Added a `@regression` Playwright workflow for verify-card lookup redirect.

## Still Deferred

- Seeded admin dashboard workflow with verified MFA.
- Seeded VIP/BUS member dashboard differences.
- Business submission/moderation browser workflow.
- Business Introduction submission/moderation browser workflow.
- Full hard-coded string scan for critical UI surfaces.
