# 02-vip-product-and-payment-links.md

## Title

Configure VIP product/price and Payment Links in Stripe

## Objective

Create a $19.99/month VIP plan in Stripe, capture IDs in env, and optionally prepare a Payment Link for Business submissions.

## Steps

1) In Stripe Dashboard → Products:
   - Create product: "VIP Membership"
   - Create recurring price: $19.99 USD, monthly.
2) Copy IDs:
   - Product ID → NEXT_PUBLIC_STRIPE_PRODUCT_VIP
   - Price ID → NEXT_PUBLIC_STRIPE_PRICE_VIP
3) Optional: Payment Link for “Submit a Business” (owner pays from $19.99/mo):
   - Create a separate product/price if needed.
   - Store its Payment Link URL in env (optional).
4) Update .env.local and .env.example accordingly.

## Files to modify

- .env.local
- .env.example

### .env.example (append/remind)

```env
# Stripe (Server + Public IDs)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRODUCT_VIP=prod_xxxxxx
NEXT_PUBLIC_STRIPE_PRICE_VIP=price_xxxxxx

# Optional: Business submission payment link
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUSINESS=
```

## Acceptance

- Stripe product and price created and IDs stored.
- Env files updated and committed (without secrets).
- Optional Payment Link captured if used in MVP.
