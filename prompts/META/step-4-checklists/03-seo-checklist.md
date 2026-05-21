# step-4-checklists/03-seo-checklist.md

## Title

SEO — Essentials for MVP

## Metadata

- [ ] Заголовки/описания заданы через Metadata API (per‑page).
- [ ] OG/Twitter images определены; корректно грузятся.

## Structured Data (JSON‑LD)

- [ ] Organization + WebSite добавлены на главной.
- [ ] Для каталога/карточек — пока не требуется (без отзывов/цен в MVP).

## Canonicals/Alternates

- [ ] Canonical без трейлинг‑слеша.
- [ ] hreflang — скелет (en), легко расширяем под i18n.

## Robots/Sitemap

- [ ] robots.txt — блокирует /admin, /member, /business, /api/\*.
- [ ] sitemap.xml — с абсолютными URL, с alternates.languages.

## Content/Semantics

- [ ] h1 один на страницу; семантическая разметка секций.
- [ ] “Special conditions…” тексты присутствуют и соответствуют политике.

## Performance impact

- [ ] Быстрый LCP (см. performance checklist) — влияет на SEO.
- [ ] Нет массивных блокирующих скриптов в head (кроме строго нужных).

## Error Handling

- [ ] Страницы 404/500 — брендированные и с навигацией назад/домой.

## Testing

- [ ] Lighthouse SEO ≥ 90.
- [ ] URL Inspection (preview) — без критичных проблем.

## Acceptance

- [ ] Метаданные, JSON‑LD, robots/sitemap — корректны.
- [ ] hreflang/alternates в head и sitemap.
- [ ] Lighthouse SEO passed, 404/500 настроены.
