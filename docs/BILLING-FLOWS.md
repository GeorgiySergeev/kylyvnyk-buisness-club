# Billing Flows

## Current Release Boundary

Billing is not release-ready in the current MVP slice.

Implemented now:

- Admin routes for payment-link records and subscription records.
- Database tables for `stripe_links` and `stripe_subscriptions`.
- Admin copy that labels both billing screens as operational shells.

Not implemented yet:

- `/api/stripe/webhook` route handler.
- Signature verification and idempotent event storage.
- Membership lifecycle updates from subscription events.
- Checkout or portal session creation from member-facing UI.
- Production smoke flow for payment link checkout and webhook replay.

## Release Rule

Do not call the release billing-ready until one of these is true:

- A billing implementation branch adds the webhook, event idempotency, tests,
  and smoke evidence.
- The release checklist explicitly marks billing deferred and keeps all
  billing surfaces labeled as operational shells.

For the current release hardening pass, billing is deferred. The app can be
verified for auth, directory, digital card, member dashboard, admin access, and
legal/public pages, but billing must remain out of the release claim.
