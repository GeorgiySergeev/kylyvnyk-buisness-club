# step-2-drizzle-ddl/README.md

## Title

Step 2 — Drizzle DDL Overview

## Objective

Сконцентрированная документация по доменной схеме (Postgres + Drizzle ORM) для KCLUB-MVP. Фокус: строгие enum-типажи, уникальности, индексы под основные запросы, соответствие юридическим и комплаенс-требованиям.

## Contents

- 00-overview-entities-and-relations.md — Общая карта сущностей и enum’ов
- 01-core-user-profile-membership-card.md — Пользователи, профили, членство, карты
- 02-geo-country-city.md — Геосправочники
- 03-catalog-business-category.md — Категории и бизнесы
- 04-partner-offers-special-conditions.md — Приватные условия партнёров
- 05-business-introductions-admin-only.md — Business Introductions (VIP-only, админ-процесс)
- 06-stripe-subscriptions-and-status.md — Подписки Stripe и события
- 07-auditlog-and-events.md — Аудит-лог
- 08-indexes-uniques-constraints.md — Индексы, уникальности, ограничения
- 09-seed-scripts-outline.md — План сидов и порядок

## Commands

- Генерация миграций: pnpm db:generate
- Применение миграций: pnpm db:migrate
- Локальная студия (опционально): pnpm db:studio

## Guardrails

- PII: публичные роуты не раскрывают email/телефоны/платежи/историю.
- High-risk: запрещённые категории не должны появляться в сид-деплоях.
- BI: без терминов MLM/affiliate/commission/earnings/passive income.
- Refund: подписки невозвратны (кроме случаев по закону) — отражено в Legal, не в DDL.

---

# step-2-drizzle-ddl/00-overview-entities-and-relations.md

## Title

Entities & Relations — Overview

## Objective

Карта доменных сущностей и связей для MVP.

## Entities

- users (id, clerk_user_id, email, status, is_admin, created_at, updated_at)
- profiles (user_id PK, first_name, last_name, phone, country_id?, city_id?, created_at, updated_at)
- memberships (id, user_id, type FREE|VIP, status ACTIVE|CANCELED, valid_to, card_id?)
- cards (id, user_id UNIQUE, number UNIQUE, member_name, member_type, status, expires_at, created_at,…)
- countries (id, iso2 UNIQUE, name)
- cities (id, country_id, name UNIQUE per country)
- categories (id, name, slug UNIQUE)
- businesses (id, owner_user_id → users, name, representative_name, email, phone?, country_id, city_id, category_id, website_url?, short_description?, status, is_top_partner, is_recommended, timestamps)
- partner_offers (id, business_id, short_text, details?, visibility PRIVATE_AFTER_LOGIN|PUBLIC, valid_from/to, priority, timestamps)
- introductions (id, created_by_user_id, target_business_id, status, internal_notes, timestamps)
- subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id UNIQUE, status_raw, period dates, cancel flags)
- stripe_events (id, event_id UNIQUE, type, object, payload jsonb, processed flags, timestamps)
- audit_logs (id, actor_user_id nullable, action, entity, entity_id, ip?, user_agent?, meta jsonb, created_at)

## Enums (Postgres)

- user_status: ACTIVE | BLOCKED
- membership_type: FREE | VIP
- membership_status: ACTIVE | CANCELED
- business_status: UNDER_REVIEW | PUBLISHED | HIDDEN
- card_status: ACTIVE | INACTIVE | EXPIRED
- offer_visibility: PRIVATE_AFTER_LOGIN | PUBLIC
- introduction_status: DRAFT | SUBMITTED | APPROVED | REJECTED | CLOSED

## Core relations

- users 1–1 profiles
- users 1–N memberships; users 1–1 cards (через UNIQUE user_id в cards)
- users 1–N businesses; users 1–N audit_logs
- businesses N–1 categories, countries, cities; 1–N partner_offers
- introductions: created_by_user_id → users; target_business_id → businesses
- subscriptions: user_id → users; stripe_events — автономная таблица идемпотентности

---

# step-2-drizzle-ddl/01-core-user-profile-membership-card.md

## Title

Core — User, Profile, Membership, Card

## Objective

Типобезопасная модель аккаунтов/ролей/карт и членства, совместимая с Clerk/Stripe.

## DDL (Postgres SQL пример)

```sql
-- Enums
CREATE TYPE user_status AS ENUM ('ACTIVE','BLOCKED');
CREATE TYPE membership_type AS ENUM ('FREE','VIP');
CREATE TYPE membership_status AS ENUM ('ACTIVE','CANCELED');
CREATE TYPE card_status AS ENUM ('ACTIVE','INACTIVE','EXPIRED');

-- Users
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id varchar(191) NOT NULL UNIQUE,
  email varchar(256) NOT NULL UNIQUE,
  status user_status NOT NULL DEFAULT 'ACTIVE',
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Profiles (1-1)
CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name varchar(100),
  last_name varchar(100),
  phone varchar(50),
  country_id int, -- optional FK (см. geo)
  city_id int,    -- optional FK (см. geo)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Cards (1 per user)
CREATE TABLE cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  number varchar(64) NOT NULL UNIQUE,
  member_name varchar(200) NOT NULL,
  member_type membership_type NOT NULL DEFAULT 'FREE',
  status card_status NOT NULL DEFAULT 'ACTIVE',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Memberships
CREATE TABLE memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type membership_type NOT NULL DEFAULT 'FREE',
  status membership_status NOT NULL DEFAULT 'ACTIVE',
  valid_to timestamptz,
  card_id uuid REFERENCES cards(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ux_membership_user_type_status
  ON memberships(user_id, type, status);
```

## Notes

- Карта (cards) гарантированно одна на пользователя (UNIQUE user_id).
- Уникальность memberships по (user_id, type, status) упрощает upsert VIP ACTIVE/CANCELED.
- PII (email/phone) не отображается в публичных роутингах.

---

# step-2-drizzle-ddl/02-geo-country-city.md

## Title

Geo — Countries & Cities

## Objective

Минимальные справочники с уникальностью по ISO2 и паре (страна, город).

## DDL

```sql
CREATE TABLE countries (
  id serial PRIMARY KEY,
  iso2 varchar(2) NOT NULL UNIQUE,
  name varchar(120) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cities (
  id serial PRIMARY KEY,
  country_id int NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name varchar(160) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cities_country ON cities(country_id);
CREATE UNIQUE INDEX ux_cities_country_name ON cities(country_id, name);
```

## Notes

- Удаление страны каскадит города (логично для справочника).
- Индексы критичны для фильтров каталога.

---

# step-2-drizzle-ddl/03-catalog-business-category.md

## Title

Catalog — Categories & Businesses

## Objective

Каталог партнёров: статусы модерации, фильтры по гео/категории, флаги витрин.

## DDL

```sql
CREATE TYPE business_status AS ENUM ('UNDER_REVIEW','PUBLISHED','HIDDEN');

CREATE TABLE categories (
  id serial PRIMARY KEY,
  name varchar(120) NOT NULL,
  slug varchar(160) NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar(200) NOT NULL,
  representative_name varchar(160) NOT NULL,
  email varchar(256) NOT NULL,
  phone varchar(50),
  country_id int NOT NULL REFERENCES countries(id),
  city_id int NOT NULL REFERENCES cities(id),
  category_id int NOT NULL REFERENCES categories(id),
  website_url varchar(512),
  short_description varchar(280),
  status business_status NOT NULL DEFAULT 'UNDER_REVIEW',
  is_top_partner boolean NOT NULL DEFAULT false,
  is_recommended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_filters ON businesses(country_id, city_id, category_id);
CREATE INDEX idx_businesses_flags ON businesses(is_top_partner, is_recommended);
```

## Notes

- Публикация устанавливает published_at.
- Флаги is_top_partner / is_recommended двигают карточки на главной.

---

# step-2-drizzle-ddl/04-partner-offers-special-conditions.md

## Title

Partner Offers — Special Conditions (private after login)

## Objective

Приватные предложения/условия, доступные только после входа.

## DDL

```sql
CREATE TYPE offer_visibility AS ENUM ('PRIVATE_AFTER_LOGIN','PUBLIC');

CREATE TABLE partner_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  short_text varchar(280) NOT NULL,
  details text,
  visibility offer_visibility NOT NULL DEFAULT 'PRIVATE_AFTER_LOGIN',
  valid_from timestamptz,
  valid_to timestamptz,
  priority int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- (опционально) полезные индексы:
-- CREATE INDEX idx_offers_business ON partner_offers(business_id);
-- CREATE INDEX idx_offers_active ON partner_offers(visibility, valid_to);
```

## Notes

- По умолчанию visibility=PRIVATE_AFTER_LOGIN — не раскрывать гостям.
- valid_to может использоваться для авто-скрытия.

---

# step-2-drizzle-ddl/05-business-introductions-admin-only.md

## Title

Business Introductions — VIP-only, Admin-managed

## Objective

Структура заявок на Business Introduction (без выплат/MLM/affiliate механик).

## DDL

```sql
CREATE TYPE introduction_status AS ENUM ('DRAFT','SUBMITTED','APPROVED','REJECTED','CLOSED');

CREATE TABLE introductions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  status introduction_status NOT NULL DEFAULT 'DRAFT',
  internal_notes varchar(1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_introductions_creator ON introductions(created_by_user_id);
CREATE INDEX idx_introductions_business ON introductions(target_business_id);
```

## Notes

- Управление статусами — только через админ-панель.
- Публичные лимиты/рейтинги/уровни — отсутствуют в MVP.

---

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

---

# step-2-drizzle-ddl/07-auditlog-and-events.md

## Title

AuditLog — Minimal Trail

## Objective

Наблюдаемость изменений: актор, действие, сущность, метаданные (без PII).

## DDL

```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action varchar(120) NOT NULL,
  entity varchar(120) NOT NULL,
  entity_id varchar(191) NOT NULL,
  ip varchar(64),
  user_agent text,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id);
```

## Notes

- meta — только non-PII: id/enum/флаги/короткие описания.
- admin-лог просмотр — только через защищённый интерфейс.

---

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

---

# step-2-drizzle-ddl/09-seed-scripts-outline.md

## Title

Seed Scripts — Outline & Order

## Objective

Идемпотентные сид-скрипты для dev/e2e окружений.

## Order

1) Countries/Cities
2) Categories
3) Users (ADMIN/VIP/FREE) — опционально связать с Clerk test users
4) Businesses (2 PUBLISHED, 1 UNDER_REVIEW)
5) (Опционально) Partner Offers — PRIVATE_AFTER_LOGIN

## Idempotency

- Используйте ON CONFLICT DO NOTHING либо предварительные SELECT’ы.
- Shadow users для локалки (без реального Clerk).

## Samples (папка scripts/seed)

- countries-cities.ts — US/UA/GB + города
- categories.ts — безопасные категории (без high-risk)
- users.ts — ADMIN/VIP/FREE (VIP: valid_to +30 дней)
- businesses.ts — 2 опубликованных (Top/Recommended), 1 на модерации

## Guardrails

- Не вставлять high-risk категории (crypto/gambling/adult/firearms/unlicensed-finance/high-risk-investments).
- Emails: example.com; без персональных данных.

## Acceptance

- pnpm db:migrate успешен, таблицы созданы.
- Повторный запуск seed-скриптов не дублирует данные.
- Базовые выборки (каталог/гео) возвращают смысловые результаты.
