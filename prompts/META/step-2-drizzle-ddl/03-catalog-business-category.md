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
