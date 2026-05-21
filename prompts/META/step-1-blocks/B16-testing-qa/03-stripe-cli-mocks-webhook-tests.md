# 03-stripe-cli-mocks-webhook-tests.md

## Title

Stripe CLI — webhook tests and idempotency smoke

## Objective

Run webhook integration locally:

- stripe listen → forward to /api/webhooks/stripe
- stripe trigger customer.subscription.created/updated/deleted
- Verify DB changes and event idempotency

## Steps

1. Install Stripe CLI and login.
2. Start Next dev.
3. Run:

- stripe listen --forward-to localhost:3000/api/webhooks/stripe
- stripe trigger customer.subscription.created
- stripe trigger customer.subscription.updated
- stripe trigger customer.subscription.deleted

1. Validate DB:

- subscriptions row updated
- memberships VIP valid_to set
- stripe_events has unique event_id with succeeded=true

## Docs/snippets

### scripts/dev/stripe-webhook.sh

```bash
#!/usr/bin/env bash
set -e
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Note

- Ensure STRIPE_WEBHOOK_SECRET from stripe listen is set in .env.local or passed at runtime.
- For CI: prefer staging environment webhooks; avoid hitting production.

## Acceptance

- Triggers succeed and update DB.
- Re-running same trigger doesn’t duplicate due to idempotency.
