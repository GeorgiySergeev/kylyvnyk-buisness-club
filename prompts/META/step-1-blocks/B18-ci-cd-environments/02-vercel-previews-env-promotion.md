# 02-vercel-previews-env-promotion.md

## Title

Vercel — preview deployments and env promotion

## Objective

Enable preview URLs per PR with safe test secrets; restrict production deploys to main and protected env.

## Steps

1) Connect GitHub repo to Vercel project.
2) Configure environments in Vercel:
   - Development/Preview:
     - Use Stripe test keys, test Redis, test DB.
     - Set NEXT_PUBLIC_SITE_URL to preview domain pattern.
   - Production:
     - Use live secrets; protect environment.
3) Deployment policy:
   - Previews on every PR automatically.
   - Production deploys only from main; require PR approvals.
4) Secrets hygiene:
   - Store secrets only in Vercel env manager.
   - Rotate on incident; separate keys per env.
5) Optional: GitHub status check requires successful CI before Vercel deploy.

## Example env mapping (Vercel UI)

- Preview
  - DATABASE_URL (preview DB)
  - STRIPE_SECRET_KEY (test)
  - STRIPE_WEBHOOK_SECRET (test)
  - NEXT_PUBLIC_STRIPE_PRICE_VIP (test price)
  - NEXT_PUBLIC_STRIPE_PRODUCT_VIP (test product)
- Production
  - DATABASE_URL (prod DB)
  - STRIPE_SECRET_KEY (live)
  - STRIPE_WEBHOOK_SECRET (live)
  - NEXT_PUBLIC_STRIPE_PRICE_VIP (live price)
  - NEXT_PUBLIC_STRIPE_PRODUCT_VIP (live product)

## Acceptance

- Every PR shows a Preview URL with test keys.
- Production deploys only from main with protected secrets.
