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
