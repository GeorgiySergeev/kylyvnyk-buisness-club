# Known Limitations

**Last updated:** 2026-06-19  
**Version:** 0.1.0 (MVP Beta)

---

## Testing Gaps

### Mobile Responsive

**Description:** Mobile-first responsive design has not been fully verified on real devices.

**Impact:** Medium  
**Affected areas:** All pages  
**Workaround:** Manual QA on target devices before public launch  
**Planned fix:** Post-launch visual regression testing for mobile viewports

### Accessibility (a11y)

**Description:** Full WCAG 2.2 AA audit not completed. Basic a11y tests exist but comprehensive axe-based scan pending.

**Impact:** Medium  
**Affected areas:** All interactive elements  
**Workaround:** Run `pnpm test:a11y` and fix violations  
**Planned fix:** Post-launch accessibility hardening sprint

### Hard-coded Strings

**Description:** Some admin pages contain hard-coded English strings instead of using next-intl.

**Impact:** Low  
**Affected files:**
- `src/app/[locale]/admin/profile/page.tsx`

**Workaround:** Acceptable for admin-only pages  
**Planned fix:** Add to i18n message files

### Stripe Sandbox Testing

**Description:** Stripe webhook processing tested via unit/integration tests but not with live Stripe CLI.

**Impact:** Low  
**Affected areas:** Checkout, subscription lifecycle  
**Workaround:** Use Stripe CLI for pre-release testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`  
**Planned fix:** Documented in RUNBOOK.md

### DB Integration Tests

**Description:** DB tests require `TEST_DATABASE_URL` environment variable pointing to disposable database.

**Impact:** Low  
**Affected areas:** Database migration and repository tests  
**Workaround:** Tests skip without variable (expected behavior)  
**Planned fix:** CI configuration with test database

---

## Performance

### No Performance Smoke Tests

**Description:** No automated performance/load testing implemented.

**Impact:** Low (at MVP scale)  
**Affected areas:** All routes  
**Workaround:** Monitor in production with Sentry/Plausible  
**Planned fix:** Add `oha` or equivalent for load testing

### Cold Starts

**Description:** Rarely-hit routes may experience Vercel cold starts.

**Impact:** Low (at MVP traffic)  
**Affected areas:** Admin routes, checkout flows  
**Workaround:** Acceptable at MVP scale  
**Planned fix:** Monitor and optimize if needed

---

## Features (Deferred to Phase 2)

### Localized Slugs

**Description:** URL slugs are the same across all locales (e.g., `/en/directory`, `/ru/directory`, `/uk/directory`).

**Status:** Deferred  
**Reason:** SEO strategy decision, requires migration  
**Planned:** Post-MVP if SEO requires localized URLs

### Document Upload KYC

**Description:** No document upload for identity verification.

**Status:** Out of scope  
**Reason:** Not required for MVP  
**Planned:** Phase 2 if compliance requires

### Internal Balance/Payouts

**Description:** No internal balance system or payout functionality.

**Status:** Out of scope  
**Reason:** Not in MVP scope (see SPEC.md)  
**Planned:** Never (not part of product vision)

### Public Leaderboards

**Description:** No public member rankings or leaderboards.

**Status:** Out of scope  
**Reason:** Not in MVP scope (see SPEC.md)  
**Planned:** Never (not part of product vision)

---

## Security

### Admin 2FA Bypass in Tests

**Description:** E2E tests skip when admin requires 2FA verification.

**Impact:** Low  
**Affected areas:** Admin E2E tests  
**Workaround:** Set `AUTH_DEV_2FA_BYPASS_ENABLED=1` in test environment  
**Planned fix:** Implement test-only 2FA bypass mechanism

### Rate Limit Fail-Open

**Description:** Rate limiters fail-open on Upstash errors in non-production environments.

**Impact:** Low  
**Affected areas:** Rate limiting  
**Workaround:** Production fails-closed (secure)  
**Planned fix:** Documented behavior

---

## Observability

### Sentry Alert Rules

**Description:** Sentry alert rules not configured for production.

**Impact:** Low  
**Affected areas:** Error monitoring  
**Workaround:** Manual monitoring during beta  
**Planned fix:** Configure alerts before public launch

### Plausible Custom Events

**Description:** Custom events defined but not verified in production.

**Impact:** Low  
**Affected areas:** Analytics  
**Workaround:** Verify after launch  
**Planned fix:** Monitor and adjust

---

## Known Issues

### Node Version Warning

**Description:** Local development may show Node version warning if using Node 22.x instead of 20.18.x.

**Impact:** None (warning only)  
**Workaround:** Use Node 20.18.x as specified in `.nvmrc`  
**Planned fix:** None (expected behavior)

### Next.js Lint Deprecation

**Description:** `next lint` is deprecated in Next.js 16.

**Impact:** Low  
**Workaround:** Migrate to ESLint CLI when upgrading to Next.js 16  
**Planned fix:** Future migration

---

## Limitations by Priority

### High Priority (Address Before Public Launch)

1. Mobile responsive verification
2. Accessibility audit
3. Sentry alert configuration

### Medium Priority (Address Post-Launch)

1. Performance smoke tests
2. Hard-coded strings in admin
3. Plausible custom events verification

### Low Priority (Accept for MVP)

1. Localized slugs
2. DB test infrastructure
3. Rate limit test coverage

---

## Reporting New Limitations

When discovering new limitations:

1. Add to this document with:
   - Description
   - Impact (low/medium/high)
   - Affected areas
   - Workaround (if any)
   - Planned fix (if any)

2. Create GitHub issue with label `limitation`

3. Update `docs/RELEASE-REPORT.md` if affects release readiness

---

**Last reviewed:** 2026-06-19  
**Next review:** Post-beta (2 weeks after launch)
