# step-3-implementations/02-stripe-billing/README.md

## Title

Implementations — Stripe Billing

## Objective

Подключить Stripe Billing для VIP-подписки: продукт/цена ($19.99/мес), Checkout Session, Customer Portal, обработчик webhooks с идемпотентностью, синхронизация статусов в БД и отмена подписки “в конце периода”.

## Deliverables

- Продукт “VIP Membership” и ежемесячная цена
- API:
  - POST /api/stripe/checkout — старт подписки (Checkout Session)
  - POST /api/stripe/portal — управление подпиской (Customer Portal)
  - POST /api/stripe/webhook — обработка checkout.session.completed, invoice.payment_succeeded, customer.subscription.updated/deleted
- Синхронизация БД (таблица subscriptions) и обновление `memberships.tier` / `memberships.status`
- Интерфейс отмены подписки в кабинете

## Guardrails

- Webhook endpoint должен проверять подпись Stripe.
- Записи webhook events в таблицу `stripe_events` для избежания дублирования (идемпотентность).
- Подписки не удаляются сразу при отмене, а помечаются как `cancelAtPeriodEnd` и остаются ACTIVE до `currentPeriodEnd`.
