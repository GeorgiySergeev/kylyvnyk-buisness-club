# step-3-implementations/04-business-crud/02-list-and-filters-public.md

## Title

Public Catalog — list/filters/details (PUBLISHED only)

## Objective

Собрать публичный каталог: список только PUBLISHED, фильтры страна/город/категория, поиск/сортировка, детальная страница с приватными условиями только после входа.

## Notes

- Этот раздел дополняет и использует реализацию B09 (Catalog Module MVP).
- Ключевые функции:
  - listBusinessesWithFilters(qs)
  - parseCatalogQuery(searchParams)
  - страницы: /catalog (список), /catalog/[id] (деталь)
- Гостям не показывать special conditions; только “доступно после входа”.

## Acceptance

- /catalog?q=spa&country=1&category=3&sort=name фильтрует и сортирует корректно.
- Гости видят приват‑заглушки; вошедшие — тексты офферов (если есть).
- Страницы устойчивы к пустым результатам, скелетоны/empty‑states присутствуют.
