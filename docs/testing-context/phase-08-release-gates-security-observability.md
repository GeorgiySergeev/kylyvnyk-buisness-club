# Phase 08: Release Gates, Security, and Observability

Date: 2026-06-07

## Goal

Turn Sprint 2 from documented intent into executable gates without expanding
the PR path into a slow full-browser suite.

## Implemented in this slice

- Added Playwright commands for `@regression`, `@a11y`, and `@visual` suites.
- Added a scheduled/manual GitHub Actions job for nightly release suites.
- Kept PR smoke separate from nightly/pre-release suites.
- Added `PLAYWRIGHT_SKIP_WEB_SERVER=1` as an escape hatch for sandboxes that
  already manage the Next dev server separately.
- Added a security-header regression test for public routes.
- Added HSTS to the shared Next.js security headers.
- Added a public-shell accessibility smoke for the skip-link target.
- Added a visual smoke that verifies the public home page renders a non-empty
  screenshot without introducing screenshot baselines yet.
- Added Sentry scrubber contract tests for sensitive headers, user email/IP,
  and emails in error messages.

## Still Deferred

- Full axe-based WCAG scans are still deferred until the project pins an a11y
  package.
- True visual snapshot baselines are deferred until the visual suite has stable
  seeded data and review ownership.
- Performance smoke remains a later Sprint 2/Sprint 4 item.
- `TEST_DATABASE_URL` must be provisioned in GitHub Secrets for the nightly DB
  migration smoke to run instead of skip.
- Restricted-network Windows sandboxes can show Google Fonts `EACCES` warnings
  during `next dev`; the Playwright assertions can still pass, but the final
  release gate should be run on Node 20.18.x in the normal environment.
