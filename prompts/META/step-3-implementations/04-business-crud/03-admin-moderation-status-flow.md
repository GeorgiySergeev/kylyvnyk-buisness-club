# step-3-implementations/04-business-crud/03-admin-moderation-status-flow.md

## Title

Admin Moderation — publish/hide/under‑review + flags

## Objective

Панель админа для модерации бизнесов:

- Статусы: UNDER_REVIEW → PUBLISHED/HIDDEN
- Флаги: Top Partner / Recommended
- publishedAt при публикации; аудит‑лог; revalidate публичных страниц

## Files

- Используем реализацию из B12:
  - src/features/admin/server/business-actions.ts — publishBusiness, hideBusiness, markUnderReview, toggleTop, toggleRecommended
  - src/app/(admin)/businesses/page.tsx — таблица со встроенными action‑кнопками

## Guardrails

- Перед publish проверять отсутствие high‑risk (см. B14 — patch в publishBusiness).
- Нет публичных рейтингов/лимитов/лидербордов в MVP.

## Acceptance

- Изменения статусов/флагов отражаются мгновенно.
- Аудит‑лог содержит события; лэндинг/каталог ревалидируются.