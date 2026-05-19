# step-2-drizzle-ddl/06-stripe-subscriptions-and-status.md

## Title

Stripe — Subscriptions & Events

## Objective

Связь пользователя с Stripe-подпиской и хранилище входящих событий (идемпотентность).

## DDL

```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id varchar(120) NOT NULL,
  stripe_subscription_id varchar(120) NOT NULL UNIQUE,
  status_raw varchar(60) NOT NULL,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ux_sub_user_customer ON subscriptions(user_id, stripe_customer_id);
CREATE INDEX idx_sub_user ON subscriptions(user_id);

CREATE TABLE stripe_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id varchar(120) NOT NULL UNIQUE,
  type varchar(120) NOT NULL,
  object varchar(60) NOT NULL,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  succeeded boolean NOT NULL DEFAULT false,
  error text
);
```

## Notes

- stripe_events обеспечивает идемпотентность webhook-процессинга.
- subscriptions.status_raw хранит сырое значение Stripe (для поддержки всех статусов).
