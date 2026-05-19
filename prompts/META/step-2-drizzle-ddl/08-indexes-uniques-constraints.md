# step-2-drizzle-ddl/08-indexes-uniques-constraints.md

## Title

Indexes & Uniques — Integrity & Performance

## Objective

Обеспечить согласованность и производительность под ключевые запросы MVP.

## Critical Uniques

- users: UNIQUE(email), UNIQUE(clerk_user_id)
- profiles: PK(user_id) — 1:1 с users
- categories: UNIQUE(slug)
- cards: UNIQUE(number), UNIQUE(user_id)
- subscriptions: UNIQUE(stripe_subscription_id), UNIQUE(user_id, stripe_customer_id)
- memberships: UNIQUE(user_id, type, status)
- stripe_events: UNIQUE(event_id)
- countries: UNIQUE(iso2)
- cities: UNIQUE(country_id, name)

## Important Indexes

- businesses:
  - status
  - (country_id, city_id, category_id) — фильтры каталога
  - (is_top_partner, is_recommended) — лэндинг
- introductions:
  - created_by_user_id, target_business_id
- audit_logs:
  - (entity, entity_id), actor_user_id
- subscriptions:
  - user_id

## Optional/Future

- FTS (pg_trgm) по businesses(name, short_description) для поиска:
  - CREATE EXTENSION IF NOT EXISTS pg_trgm;
  - CREATE INDEX idx_businesses_fts ON businesses USING GIN (name gin_trgm_ops, short_description gin_trgm_ops);
