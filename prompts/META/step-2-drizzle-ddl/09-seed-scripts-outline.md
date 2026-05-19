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
