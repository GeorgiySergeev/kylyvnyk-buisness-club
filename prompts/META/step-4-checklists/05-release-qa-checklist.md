# step-4-checklists/05-release-qa-checklist.md

## Title

Release QA — Final Pass

## Config/Infra

- [ ] Все env заданы на Preview/Prod (Clerk/Stripe/DB/Redis/Turnstile/Sentry/Plausible).
- [ ] Миграции применены (pnpm db:migrate), сиды прогнаны (минимум — категории/гео).
- [ ] Доступы/домены в Vercel настроены; Preview — тестовые ключи, Prod — боевые.

## Critical Flows

- [ ] Регистрация FREE (email verification через Clerk).
- [ ] Выдача Digital Card и QR; /verify-card/:number доступен, только разрешённые поля.
- [ ] Upgrade до VIP: Checkout → success/cancel; Customer Portal открывается.
- [ ] Cancel VIP: cancel_at_period_end + дата окончания видна.
- [ ] Каталог: фильтры/поиск/деталь партнёра; приватные условия скрыты для гостя.
- [ ] Submit Business (VIP): отправка, статус UNDER_REVIEW.
- [ ] Админ: модерация (publish/hide/flags), Introductions — обновление статуса/нотов.
- [ ] Логи аудита видны в /admin/logs.

## Legal/Compliance

- [ ] Terms/Privacy/Cookie/Refund/Rules/Disclaimer/Contact — страницы существуют и линки в футере.
- [ ] Дисклеймеры в футере соответствуют формулировкам.
- [ ] Запрещённые категории не проходят сабмит/паблиш.

## Performance/A11y/SEO

- [ ] Lighthouse (Perf/SEO/A11y/Best Practices) ≥ 90 на / и /catalog.
- [ ] Axe — без критичных ошибок.
- [ ] sitemap/robots/JSON‑LD/OG/Twitter — корректны.

## Observability/Monitoring

- [ ] Sentry получает события; релизы мапятся.
- [ ] Plausible считает pageviews и цели (VIP‑CTA, Checkout‑Start, Verify‑Card‑View).
- [ ] (Опц.) аптайм‑мониторинг пингует / и /catalog.

## Load/Smoke

- [ ] oha 20s×20c на / и /catalog — без 5xx, стабильный TTFB.
- [ ] E2E Playwright: sign‑in, checkout redirect, verify‑card — зелёные.

## Rollback/Runbook

- [ ] Документирован откат (revert deploy), где смотреть ошибки (Sentry), как перезапустить вебхуки, как восстановить БД из снапшота.
- [ ] Ответственные на выпуск/поддержку — назначены, контакты известны.

Команды для быстрой проверки

```bash
# локально
pnpm build && pnpm start
pnpm lint && pnpm typecheck && pnpm test
# e2e
pnpm e2e
# нагрузочный smoke
npx oha -z 20s -c 20 https://<preview>/
```

## Acceptance

- [ ] Все критические пользовательские флоу — зелёные.
- [ ] Перф/SEO/A11y цели достигнуты.
- [ ] Мониторинг/алерты включены.
- [ ] Документация по откату/поддержке — готова.
