# step-3-implementations/04-business-crud/README.md

## Title

Implementations — Business CRUD

## Objective

Собрать end-to-end жизненный цикл бизнес‑профиля:

- Создание (VIP‑только, UNDER_REVIEW)
- Публичный список/фильтры/деталь (только PUBLISHED)
- Админ‑модерация (UNDER_REVIEW → PUBLISHED/HIDDEN + флаги)
- Кабинет владельца (просмотр статуса + базовое редактирование с повторной модерацией)

## Deliverables

- /business/submit — форма подачи (VIP), статус UNDER_REVIEW
- /catalog — публичный список с фильтрами и деталями (без открытых скидок для гостей)
- /admin/businesses — модерация (publish/hide/flags)
- /business/manage — кабинет владельца с базовым редактированием (переводит обратно в UNDER_REVIEW)

## Guardrails

- High‑risk категории/ключевые слова — запрещены (см. B14 Compliance Guards)
- Публичные страницы не показывают скидки/PII; special conditions — после входа
- Один бизнес на VIP в MVP