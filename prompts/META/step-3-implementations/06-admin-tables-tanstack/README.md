# step-3-implementations/06-admin-tables-tanstack/README.md

## Title

Implementations — Admin Tables (TanStack)

## Objective

Прокачать SSR-таблицы админки до интерактивных на TanStack Table:

- Клиентская сортировка/фильтры по текущей странице
- Серверная пагинация через query-параметры (page/pageSize + фильтры)
- Экшены модерации (publish/hide/flags) для бизнесов
- CRUD для справочников (категории/страны) в мини-форматах

## Deliverables

- Базовый DataTable-компонент (TanStack)
- UsersTable с поиском по email/статусу
- BusinessesTable с модерацией и фильтрами
- SubscriptionsTable с фильтрами по статусу/поиску
- Categories/Countries: простые формы add/edit и таблицы
- Audit Logs: фильтры по action/entity и датам (минимально)

## Install

```bash
pnpm add @tanstack/react-table
```

## Guardrails

- Все /admin-* страницы защищены requireAdminWithMfa
- Никаких PII в логах/мета; только необходимые поля для управления
- Действия модерации — через Server Actions с ауди́том
