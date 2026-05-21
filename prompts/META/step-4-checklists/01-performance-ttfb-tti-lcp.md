# step-4-checklists/01-performance-ttfb-tti-lcp.md

## Title

Performance — TTFB/TTI/LCP (mobile‑first)

## Targets (mobile, 4G, mid‑tier device)

- LCP < 2.5s
- CLS < 0.1
- TBT < 300ms (или INP < 200ms)
- TTFB:
  - SSG/ISR страниц ≈ < 200ms
  - SSR страниц ≈ < 500ms (зависит от БД/гео)

## Server/Rendering

- [ ] Используйте RSC/Server Components максимально, Client Components — только при необходимости.
- [ ] Для публичных страниц — SSG/ISR с разумным revalidate (например, 60–300s).
- [ ] Edge runtime для лёгких публичных JSON‑эндпоинтов (e.g., verify-card API).
- [ ] Server Actions — избегать лишних клиентских мутаций и JS.
- [ ] Избегать N+1 запросов: скомпонуйте join/детерминированные запросы в Drizzle.

## Data/DB

- [ ] Индексы под основные фильтры каталога (status, country_id, city_id, category_id) — присутствуют.
- [ ] Пагинация с limit/offset + строгое поле сортировки (publishedAt/createdAt).
- [ ] ILIKE/поиск ограничить минимально; FTS (pg_trgm) — отложить, но есть план.
- [ ] Кэширование публичных RSC‑запросов (segment‑level caching при SSG/ISR).

## Next.js assets

- [ ] next/image для всех картинок (размеры/quality/placeholder).
- [ ] next/font для шрифта (display=swap), без self‑host кроме необходимости.
- [ ] Preload критичных шрифтов: автоматом через next/font.
- [ ] Preconnect/dns‑prefetch к внешним (Stripe, Plausible, Clerk) в <head>.
- [ ] Ограничить 3P скрипты; async/defer/low‑priority где возможно.

Пример preconnect

```tsx
// app/layout.tsx <head>
<link rel="preconnect" href="https://js.stripe.com" />
<link rel="preconnect" href="https://plausible.io" />
```

## JS/CSS Budgets

- [ ] Минимизировать клиентский JS (без крупных UI библиотек сверх shadcn/ui).
- [ ] Разделение кода (dynamic import) для крупных разделов.
- [ ] Убрать dead code; следить за bundle‑анализом.

Команда для анализа (локально)

```bash
pnpm add -D @next/bundle-analyzer
# wrap next.config.js with analyzer and check report
```

## Network/HTTP

- [ ] Gzip/Brotli включены (Vercel — автоматически).
- [ ] Кэш заголовков для статических ассетов (immutable).
- [ ] HTTP keep‑alive/HTTP2 (Vercel — автоматически).

## Images/Icons

- [ ] Размеры и aspectRatio заданы (без layout shift).
- [ ] SVG иконки инлайн (без лишних запросов), монограммы для логотипов‑заглушек.

## Testing (local + preview)

- [ ] Lighthouse (mobile) ≥ 90 Performance на / и /catalog.
- [ ] WebPageTest/Pagespeed — проверить LCP/TTFB на предпросмотре.
- [ ] Smoke под нагрузкой (oha): нет 5xx, стабильный TTFB.

Команды

```bash
# dev build perf (пример)
pnpm build && pnpm start
# oha (20s / 20 conc)
npx oha -z 20s -c 20 https://<preview>/
npx oha -z 20s -c 20 https://<preview>/catalog
```

## Acceptance

- [ ] Выполнены бюджеты LCP/CLS/TBT/TTFB.
- [ ] Пройдены Lighthouse/WebPageTest со скринами.
- [ ] Никаких критичных CLS (img размеры/OG/hero).
- [ ] Bundle‑отчёт: нет лишних крупняков в клиентском JS.
