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
