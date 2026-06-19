# Pre-Launch Checklist

**Last updated:** 2026-06-19  
**Version:** 0.1.0 (MVP Beta)

Use this checklist before deploying to production for the first time.

---

## Environment Variables

### Required Secrets

- [ ] `DATABASE_URL` — Supabase pooled connection string
- [ ] `DATABASE_URL_DIRECT` — Supabase direct connection string (migrations)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key
- [ ] `STRIPE_SECRET_KEY` — Stripe secret key (live mode)
- [ ] `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- [ ] `STRIPE_PRICE_VIP_ANNUAL` — Stripe VIP annual price ID
- [ ] `STRIPE_PRICE_BUSINESS_ANNUAL` — Stripe Business annual price ID
- [ ] `STRIPE_PORTAL_CONFIGURATION_ID` — Stripe Customer Portal configuration ID
- [ ] `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile secret key
- [ ] `TURNSTILE_SITE_KEY` — Cloudflare Turnstile site key
- [ ] `UPSTASH_REDIS_REST_URL` — Upstash Redis REST URL
- [ ] `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis REST token
- [ ] `NEXT_PUBLIC_SENTRY_DSN` — Sentry DSN
- [ ] `SENTRY_AUTH_TOKEN` — Sentry auth token (for source maps)
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — Plausible domain

### Configuration

- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_APP_URL` — Production URL (e.g., `https://kclub.dev`)
- [ ] `AUTH_DEV_PHONE_BYPASS_ENABLED=0` (disabled in production)
- [ ] `AUTH_DEV_2FA_BYPASS_ENABLED=0` (disabled in production)

### Documentation

- [ ] `.env.example` is up to date
- [ ] `docs/ENV.md` documents all environment variables
- [ ] Vercel environment variables configured for production/preview/development

---

## Database

### Supabase

- [ ] Production database created
- [ ] Migrations applied successfully
- [ ] Seed data loaded (countries, categories, roles)
- [ ] Backup schedule enabled (daily)
- [ ] Point-in-time recovery enabled
- [ ] Connection pooling configured (PgBouncer)

### Verification

- [ ] `pnpm db:migrate` runs successfully
- [ ] `pnpm test:db` passes (with TEST_DATABASE_URL)
- [ ] Admin user created with 2FA enabled
- [ ] Test user accounts created for QA

---

## Stripe

### Configuration

- [ ] Stripe account in live mode
- [ ] Products created:
  - [ ] VIP Membership (annual)
  - [ ] Business Placement (annual)
- [ ] Prices created:
  - [ ] VIP annual price
  - [ ] Business annual price
- [ ] Customer Portal configured
- [ ] Webhook endpoints configured:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_failed`

### Verification

- [ ] Webhook signature verification works
- [ ] Idempotency prevents duplicate processing
- [ ] Checkout redirects configured correctly
- [ ] Customer Portal accessible

### Testing

- [ ] Test checkout flow in Stripe test mode
- [ ] Test subscription cancellation
- [ ] Test failed payment handling
- [ ] Verify webhook events processed correctly

---

## Authentication

### Supabase Auth

- [ ] SMS OTP configured
- [ ] Phone provider enabled
- [ ] SMS template customized
- [ ] Rate limits configured

### Verification

- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Sign out works
- [ ] Onboarding redirect works
- [ ] Dev bypass disabled in production

---

## Security

### Headers

- [ ] Security headers configured in `next.config.ts`
- [ ] CSP allowlist includes all required domains
- [ ] HSTS enabled with preload
- [ ] X-Frame-Options: DENY

### Bot Defense

- [ ] Turnstile configured
- [ ] Turnstile site key in environment
- [ ] Turnstile secret key in environment
- [ ] Rate limits configured

### Admin

- [ ] Admin 2FA enforced
- [ ] Admin accounts have 2FA enabled
- [ ] Admin routes protected

### Verification

- [ ] `tests/e2e/regression/security-headers.spec.ts` passes
- [ ] `tests/contract/security/csp-allowlist.test.ts` passes
- [ ] `tests/unit/auth/turnstile.test.ts` passes

---

## Observability

### Sentry

- [ ] Sentry project created
- [ ] DSN configured
- [ ] Source maps uploading (CI only)
- [ ] PII scrubber configured
- [ ] Alert rules configured:
  - [ ] Error rate threshold
  - [ ] Critical errors
  - [ ] Webhook failures

### Plausible

- [ ] Plausible site created
- [ ] Domain configured
- [ ] Custom events defined:
  - [ ] `signup_started`
  - [ ] `signup_completed`
  - [ ] `checkout_started`
  - [ ] `checkout_completed`
  - [ ] `card_verified`
  - [ ] `business_published`

### Verification

- [ ] Sentry captures errors
- [ ] Sentry scrubs PII
- [ ] Plausible tracks page views
- [ ] Plausible custom events fire

---

## Content

### Legal Pages

- [ ] Terms of Use reviewed by legal
- [ ] Privacy Policy reviewed by legal
- [ ] Cookie Policy reviewed by legal
- [ ] Refund Policy reviewed by legal
- [ ] Club Rules reviewed by legal
- [ ] Partner Rules reviewed by legal
- [ ] Business Introduction Rules reviewed by legal
- [ ] Disclaimer reviewed by legal
- [ ] Contact Us page has correct contact info

### i18n

- [ ] All message keys present in en/ru/uk
- [ ] Translations reviewed by native speakers
- [ ] Legal text reviewed by legal in all locales
- [ ] No forbidden vocabulary (run `pnpm vocab:check`)

### SEO

- [ ] `robots.txt` configured
- [ ] `sitemap.xml` generated
- [ ] Meta tags configured
- [ ] Open Graph tags configured
- [ ] Verify card pages have `robots: noindex`

---

## Testing

### Automated Tests

- [ ] `pnpm lint` passes
- [ ] `pnpm vocab:check` passes
- [ ] `pnpm env:check` passes
- [ ] `pnpm build` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] `pnpm test:coverage` passes
- [ ] `pnpm test:e2e:smoke` passes
- [ ] `pnpm test:e2e:regression` passes
- [ ] `pnpm test:a11y` passes (or known violations documented)
- [ ] `pnpm verify` passes

### Manual Testing

- [ ] Sign up flow tested
- [ ] Sign in flow tested
- [ ] Dashboard tested for all roles (FREE, VIP, BUSINESS, ADMIN)
- [ ] Business submission tested
- [ ] Business moderation tested
- [ ] Introduction workflow tested
- [ ] Checkout flow tested
- [ ] Subscription cancellation tested
- [ ] Verify card flow tested
- [ ] Admin operations tested

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Deployment

### Vercel

- [ ] Project configured
- [ ] Production branch: `main`
- [ ] Preview deployments enabled
- [ ] Environment variables configured
- [ ] Custom domain configured
- [ ] SSL certificate active

### DNS

- [ ] Domain points to Vercel
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] Redirects configured (www → apex or vice versa)

### Monitoring

- [ ] Vercel analytics enabled
- [ ] Uptime monitoring configured
- [ ] Alert contacts configured

---

## Rollback Plan

### Preparation

- [ ] Git tag created: `v0.1.0`
- [ ] Database backup created
- [ ] Previous deployment URL documented
- [ ] Rollback contact person identified

### Documentation

- [ ] `docs/RELEASE-REPORT.md` created
- [ ] `docs/KNOWN-LIMITATIONS.md` updated
- [ ] Rollback steps documented
- [ ] Emergency contacts listed

---

## Final Verification

### Release Gate

```bash
pnpm verify
```

Expected: All checks pass

### Smoke Test

```bash
pnpm test:e2e:smoke
```

Expected: All smoke tests pass

### Regression Test

```bash
pnpm test:e2e:regression
```

Expected: All regression tests pass

---

## Sign-off

### Technical

- [ ] Code reviewed by tech lead
- [ ] Security reviewed by tech lead
- [ ] Performance acceptable
- [ ] Tests passing

### Product

- [ ] Features match SPEC.md
- [ ] UX approved by product
- [ ] Legal pages approved
- [ ] Copy reviewed

### Operations

- [ ] Monitoring configured
- [ ] Alerts configured
- [ ] Support contacts identified
- [ ] Rollback plan tested

---

## Deployment Command

```bash
# Deploy to production
vercel --prod

# or push to main branch
git push origin main
```

---

## Post-Launch

### Immediate (First Hour)

- [ ] Monitor Sentry for errors
- [ ] Monitor Plausible for traffic
- [ ] Monitor Stripe for webhook failures
- [ ] Check Vercel deployment status
- [ ] Verify all routes accessible

### First Day

- [ ] Review Sentry error rate
- [ ] Review Plausible analytics
- [ ] Check Stripe dashboard
- [ ] Monitor support channels
- [ ] Address critical issues

### First Week

- [ ] Review user feedback
- [ ] Analyze conversion funnels
- [ ] Identify performance bottlenecks
- [ ] Plan post-launch improvements
- [ ] Schedule retrospective

---

**Checklist completed by:** [Name]  
**Date:** [Date]  
**Approved for launch:** [Yes/No]
