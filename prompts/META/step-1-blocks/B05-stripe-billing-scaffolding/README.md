# B05: Stripe Billing Scaffolding

## Overview

This block outlines the step-by-step instructions for implementing the **Stripe Billing Scaffolding** functionality in the KYLYVNYK CLUB project.

## Steps

1. **[Stripe SDK and base config (server-only)](./01-stripe-sdk-and-config.md)**
   Install Stripe, create a typed SDK client, and centralize env access. Provide helpers for site URL and product/price IDs.

2. **[Configure VIP product/price and Payment Links in Stripe](./02-vip-product-and-payment-links.md)**
   Create a $19.99/month VIP plan in Stripe, capture IDs in env, and optionally prepare a Payment Link for Business submissions.

3. **[Checkout Session (subscription) and Customer Portal endpoints](./03-checkout-session-and-customer-portal.md)**
   Create API routes to: - Start a Stripe Checkout Session for VIP subscription. - Open Stripe Billing Customer Portal for existing subscribers.

4. **[Stripe Webhook endpoint with idempotency and event logging](./04-webhook-endpoint-and-idempotency.md)**
   Handle subscription lifecycle events and log all incoming Stripe events idempotently to DB.

5. **[Sync subscription status to Membership model](./05-subscription-status-sync.md)**
   Ensure VIP Membership reflects Stripe status: - ACTIVE while subscription is active or cancel_at_period_end=true (until period end). - CANCELED when cancellation requested; valid_to tracks current_period_end.

6. **[Cancel VIP membership (self-serve) + UI hook](./06-cancel-vip-membership.md)**
   Provide an authenticated endpoint that sets cancel_at_period_end=true in Stripe, updates DB, and returns remaining access period.

## Overall Acceptance Criteria

Upon completion of this block:

- All configuration and implementations described in the steps are completed.
- The application runs correctly without errors.
- Code aligns with the project's quality and architectural standards.
