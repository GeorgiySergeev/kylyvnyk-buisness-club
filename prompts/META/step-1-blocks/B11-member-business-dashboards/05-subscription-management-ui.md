# 05-subscription-management-ui.md

## Title

Subscription Management — view/cancel with Portal access

## Objective

Provide a consolidated, mobile-first UI for subscription management within /member/subscription.

## Steps

1) Reuse SubscriptionStatusPanel (S04).
2) Ensure POST /api/stripe/portal works (existing from B05).
3) Ensure CancelVipButton (B05 S06) is visible and shows message.

## Files to verify

- src/app/(member)/subscription/page.tsx
- src/features/membership/subscription-status-panel.tsx
- src/components/member/cancel-vip-button.tsx
- src/app/api/stripe/portal/route.ts

## Acceptance

- Member can open Stripe Portal and self-cancel.
- UI shows current period end and cancel flag.
- Error states are handled gracefully (no customer → informative message).
