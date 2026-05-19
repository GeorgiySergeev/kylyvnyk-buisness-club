# step-3-implementations/02-stripe-billing/01-products-prices-setup.md

## Title

Products & Prices Setup

## Objective

Конфигурация Stripe-клиента и переменных окружения для продукта.

## Files

### src/lib/stripe.ts

```ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10', // Укажите актуальную версию
  appInfo: {
    name: 'KYLYVNYK CLUB MVP',
    version: '1.0.0',
  },
});
```

### .env.local (добавить)

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PRODUCT_VIP=prod_...
NEXT_PUBLIC_STRIPE_PRICE_VIP=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Acceptance

- `stripe` инициализирован с нужной версией API.
- Необходимые ключи задокументированы для `.env`.