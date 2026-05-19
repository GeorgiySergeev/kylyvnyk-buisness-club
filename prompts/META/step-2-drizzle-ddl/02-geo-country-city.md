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
