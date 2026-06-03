# Billing Flows

## Current Release Boundary

Billing is **release-ready** as of the current MVP slice.

Implemented:

- `/api/stripe/webhook` route handler with signature verification and
  idempotent event claim (`INSERT ... ON CONFLICT DO NOTHING RETURNING`).
- Handled event types: `checkout.session.completed`,
  `customer.subscription.created`, `customer.subscription.updated`,
  `customer.subscription.deleted`, `invoice.payment_failed`.
- Membership lifecycle state machine (ACTIVE → PAST_DUE → CANCELED →
  EXPIRED) with upsert + audit logging on every transition.
- Checkout session creation (VIP + Business) via server actions.
- Stripe Customer Portal session creation for self-service.
- Cancel VIP flow via server action.
- Payment method management + SetupIntent.
- Subscription management UI (member-subscription-tab, vip-upgrade-panel).
- Plan code / price ID resolution from Stripe metadata with fallback.
- Daily Stripe reconciliation cron (03:00 UTC via Vercel Cron) that
  syncs local subscription state against Stripe's source of truth.
- Admin routes for payment-link records and subscription records.
- Database tables for `stripe_events`, `stripe_links`, and
  `stripe_subscriptions`.

Test coverage:

- `tests/billing/membership-lifecycle.test.ts` — plan resolution,
  status mapping, effective membership, checkout reconciliation,
  transition detection.
- `tests/billing/webhook-route.test.ts` — subscription.created plan
  resolution, payment_failed status mapping, transition detection,
  effective membership after payment failure.
- `tests/billing/stripe-reconciliation.test.ts` — reconciliation
  status mapping, plan resolution, period extraction, transition
  detection, post-reconciliation effective membership.
- `tests/billing/member-billing.test.ts` — billing label and invoice
  DTO mapping.
- `tests/billing/subscription-period.test.ts` — period end extraction.

## Release Rule

Billing is release-ready. The webhook handler, event idempotency,
membership lifecycle, reconciliation cron, and unit tests have all
landed. Production e2e/browser Playwright tests remain manual per
`RELEASE-STATUS.md`.
