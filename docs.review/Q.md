# Полное ре‑ревью репозитория (commit `bdfd681`)

## 1. Тестирование документации — итоговое ревью

### 1.1 Чего реально достигла команда — отдаю должное

То, что лежит в `prompts/META/`, это не просто «папки с заголовками», как мне показалось вначале. Это **полноценный исполнимый промт‑план MVP** объёмом ~150–200 КБ markdown. По уровню детализации он сильно выше среднего «AI‑бутстрапа»:

- **B01–B19 step‑1‑blocks** — 19 блоков, в каждом 4–7 шагов с фиксированным контрактом `Title / Objective / Steps / Files to add / Acceptance`. Это правильный формат для AI‑агента.
- **step‑2‑drizzle‑ddl** — единый README на ~20 КБ содержит готовый каркас всех таблиц (users, profiles, countries, cities, categories, businesses, partnerOffers, cards, memberships, introductions, subscriptions, stripeEvents, auditLogs), enum‑ы, индексы, relations и команды `pnpm db:generate / migrate / studio`.
- **step‑3‑implementations** — пять модулей с готовым TS‑кодом (auth/clerk, stripe‑billing, forms‑rhf‑zod, business‑crud, digital‑club‑card, admin‑tables‑tanstack).
- **step‑4‑checklists** — отдельная папка под чек‑листы.
- **Юридические гард‑рейлы прописаны в каждом критичном блоке** (B12.05 явно содержит фразу `No commissions, bonuses or MLM mechanics`, B13 — отдельный блок «legal-compliance-pages», B14 — security hardening, B10.05 — `pii-visibility-policy`). Это редко встречается на этапе планирования.

Иначе говоря — фронт «что строим» и «каким кодом» проработан гораздо лучше, чем стандарт индустрии для MVP. Дальнейшая критика — про инженерные швы, а не про общее качество.

### 1.2 Что не работает — построчно, с пояснениями

#### Уровень репозитория

| Находка                                                             | Файл                                                                                                          | Почему это критично                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env`, `.env.example`, `drizzle.config.ts` — **0 байт**            | корень                                                                                                        | Промты ссылаются на `process.env.DATABASE_URL`, `STRIPE_WEBHOOK_SECRET`, `CLERK_*`, `UPSTASH_*`, `TURNSTILE_*` — но ни один из них не перечислен в репо. AI‑агент при исполнении B01 не знает, какие переменные обязательны. Это первый блокер.                           |
| `src/db/` пустой                                                    | корень                                                                                                        | Хотя в step‑2 README весь код схемы расписан, ни одного `.ts` не закоммичено. Это значит, что B03 → B04 → B05 нельзя выполнить «по плану»: они ссылаются на `@/db/schema/user`, `@/db/schema/membership` и т.д., которых физически нет.                                   |
| 5 META‑файлов всё ещё **0 байт**                                    | `prompts/META/INDEX.md`, `CONTRIBUTING.md`, `STYLE-GUIDE.md`, `NAMING-CONVENTIONS.md`, `PROMPT-GUIDELINES.md` | Это «обложка» промт‑системы: где навигация, как добавлять новые блоки, в каком стиле писать. Без INDEX.md агент не знает порядок исполнения (B01→B02→…→B19, потом step‑2, потом step‑3?). Без NAMING/STYLE — каждый шаг будет дрейфовать по стилю. Это **второй блокер**. |
| Нет `README.md` репо                                                | корень                                                                                                        | На GitHub страница пустая. Любой второй разработчик / опенкод‑агент при первом заходе не понимает, с чего начать.                                                                                                                                                         |
| Нет `AGENTS.md` / `CLAUDE.md` / `.opencode/` / `.cursor/rules`      | корень                                                                                                        | Промты есть, но **правила для агента** (как себя вести, какой словарь нельзя использовать, какие команды разрешены) не прописаны.                                                                                                                                         |
| Нет `.nvmrc`, `.tool-versions`, `pnpm-workspace.yaml`, `turbo.json` | корень                                                                                                        | Ваше ТЗ упоминает Turborepo + pnpm workspaces — в репо нет ни намёка. SPEC/CONTEXT тоже о монорепе молчат. Это нерешённое расхождение.                                                                                                                                    |

#### Уровень содержания промтов (нашёл при чтении)

| #   | Файл                                                                 | Проблема                                                                                                                                                                                                                                                                                                                                           | Почему важно                                                                                                                                                                                                                                                                                |
| --- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `step-2/README.md` → `users.ts`                                      | Файл импортирует `import { profiles } from './user'` **сам из себя** (циклический импорт внутри одного модуля). Также `auditLogs` импортируется из `./audit`, что породит **circular import** между `user.ts ↔ audit.ts`.                                                                                                                          | TS соберётся, но во время выполнения `relations` могут получить `undefined`. AI‑агент скопирует это as‑is.                                                                                                                                                                                  |
| 2   | `step-2/README.md` → `profiles.countryId`                            | Объявлен как `varchar(36)`, но в `businesses` `countryId: integer`. И в комментарии прямо написано «можно потом переделать на integer FK».                                                                                                                                                                                                         | Из коробки **в схеме сидит несовместимость**: профайл нельзя джойнить с countries по типу. Это попадёт в первую же миграцию. Нужно сразу сделать `integer`.                                                                                                                                 |
| 3   | `step-2/README.md` → `memberships.uxUserActive`                      | Уникальность по `(userId, type, status)` означает «один пользователь не может иметь две одинаковых строки `(VIP, ACTIVE)`», но при `onConflictDoUpdate` в Stripe‑handler (B05.04) логика «вставить новую запись с другим статусом или продлить старую» становится двусмысленной. История подписок при этом теряется (UPDATE поверх той же строки). | Это **главный архитектурный риск биллинга**. Нужно либо хранить историю подписок отдельной таблицей, либо однозначно жить «всегда одна строка memberships на (user,type)» — но тогда индекс надо строить по `(userId, type)` без status.                                                    |
| 4   | `B05/04-webhook-endpoint-and-idempotency.md`                         | `s.current_period_end` — поле, **которое Stripe удалил из объекта `Subscription`** на последних версиях API (теперь находится на уровне `subscription.items.data[*].current_period_end`).                                                                                                                                                          | На свежем Stripe SDK код упадёт с `TypeError: Cannot read properties of undefined`. Надо явно зафиксировать `apiVersion` в Stripe конфиге и достать поле через items.                                                                                                                       |
| 5   | `B04/03-roles-and-profile-attributes.md`                             | `auth()` из `@clerk/nextjs/server` в Clerk v6 стал **async** (`const { userId } = await auth()`). В промте — синхронный вызов.                                                                                                                                                                                                                     | На свежем Clerk код упадёт. Нужно `await`.                                                                                                                                                                                                                                                  |
| 6   | `B10/03-verify-card-public-route.md`                                 | `revalidate = 120` — кеш страницы. Но если карту администратор заблокировал (`status: INACTIVE`), посетитель ещё 2 минуты увидит «ACTIVE». Для **публичной верификации** это уязвимость.                                                                                                                                                           | Нужен `cache: 'no-store'` либо `revalidateTag('card:<number>')` + триггер инвалидации при admin‑update.                                                                                                                                                                                     |
| 7   | `B10/03` верификация карты                                           | Нет **rate‑limit + Turnstile** на самом роуте — а это публичная точка с предсказуемым форматом `VIP-UA-NNNNNN`. Энумерация номеров возможна.                                                                                                                                                                                                       | Нужно: Turnstile перед формой ввода, Upstash rate‑limit per IP+number, и не‑детерминированные номера (B10.01 это решает, проверьте `entropy ≥ 64 bit`).                                                                                                                                     |
| 8   | `B15/01-next-intl-skeleton`                                          | Locales = `['en']`. **А в вашем ТЗ — RU / EN / UK.** SPEC ещё и на русском.                                                                                                                                                                                                                                                                        | Решение «MVP single‑locale, расширим потом» ОК для маркетинга, но если RU/UK всё‑таки нужны на старте — это надо зафиксировать **до** B06 (routing), потому что URL‑структура `/[locale]/...` затрагивает весь App Router.                                                                  |
| 9   | `B12/05-introductions-management-stub`                               | Все статусы (`SUBMITTED`, `APPROVED`, `REJECTED`, `CLOSED`, `DRAFT`) переключаются одним select без машины состояний. Можно вернуться из `CLOSED` обратно в `DRAFT`.                                                                                                                                                                               | Для аудита и compliance это плохо. Нужна явная state machine (например, XState или просто таблица допустимых переходов) и аудит каждого перехода.                                                                                                                                           |
| 10  | `step-3-implementations/04-business-crud/01-create-business-form.md` | Файл 8 КБ — отдельный поток. Не проверил, но раз есть `partnerOffers` с `visibility: PRIVATE_AFTER_LOGIN`, в форме создания надо запретить возможность ставить `PUBLIC` пользователем (только админ).                                                                                                                                              | Иначе любой бизнес выложит «-30% всем» в публичный поиск Google → ТЗ‑шный запрет «специальные условия — только после логина» нарушен.                                                                                                                                                       |
| 11  | step‑1‑blocks vs step‑2‑drizzle vs step‑3 — **дублируют друг друга** | B03 «initial-empty-schemas», step‑2 «полная схема», step‑3/02 «stripe billing» vs B05 «stripe billing scaffolding»                                                                                                                                                                                                                                 | Когда у агента в контексте 2 версии одной и той же фичи — он выберет ту, что выше в промте. Нужен **INDEX.md**, который чётко скажет: «step‑1 = каркас, step‑2 = финальная DDL заменяет B03.03, step‑3 = реализации заменяют скаффолды B04/B05». Сейчас этого нет → главный риск конфликта. |
| 12  | Все промты                                                           | Нет `Inputs` (что должно уже существовать в репо перед запуском) и `Outputs` (что должно быть на выходе помимо файлов — например, обновление `.env.example`, обновление миграций).                                                                                                                                                                 | Без этого agent‑run перестаёт быть идемпотентным.                                                                                                                                                                                                                                           |
| 13  | Все промты                                                           | Нет указания **версий зависимостей** (`next@15.x`, `react@19.x`, `@clerk/nextjs@^6`, `stripe@^17`, `drizzle-orm@^0.36`, `next-intl@^3.x`).                                                                                                                                                                                                         | Бутстрап через 3 месяца будет другим (Next 16, React 20…). Это «late binding» и тоже частый источник провалов AI‑бутстрапа.                                                                                                                                                                 |
| 14  | Все промты                                                           | Нет блока **Rollback / Undo** — что делать, если шаг сломал предыдущий.                                                                                                                                                                                                                                                                            | На длинной цепочке (19 блоков × 4–7 шагов = ~100 шагов) хоть один точно упадёт. Без rollback‑инструкции человек должен разбираться вручную.                                                                                                                                                 |
| 15  | `docs/CONTEXT.md`                                                    | Заголовок `Context-ID: kclub-mvp-<commit-sha>` без значения. AI это в логи попадёт.                                                                                                                                                                                                                                                                | Тривиально, но раздражает.                                                                                                                                                                                                                                                                  |
| 16  | `docs/SPEC.md` vs реальные промты                                    | SPEC говорит "premium, fast, mobile-first", промты делают **dark/gold тему, no light**. Но в SPEC явных требований к тёмной/светлой нет.                                                                                                                                                                                                           | Дизайн‑решение принято в промтах де‑факто. Должно быть отражено в SPEC или в `DESIGN.md`.                                                                                                                                                                                                   |

### 1.3 Что мне нравится в текущем подходе

- **Идемпотентный формат** `Title/Objective/Steps/Files/Acceptance` — это правильная форма для Opencode / Claude Code / Cursor agent. Они умеют такое исполнять «в один прыжок».
- **Audit log + stripe_events с уникальным `event_id`** — корректный pattern для идемпотентных вебхуков.
- **Cards отделены от memberships** — правильное моделирование (карта переживает смену статуса VIP/FREE).
- **`PRIVATE_AFTER_LOGIN` как enum для offer visibility** — отличная защита от «утечки скидок» в публичный SEO.
- **`stripe_events.payload jsonb` + `error text` + `succeeded boolean`** — пригодно для replay.
- **Юридический футер** уже разнесён по `i18n/messages/en/legal.json` — это значит, легал не растащит по компонентам.

---

## 2. Какие ещё доки нужны для работы с Opencode и аналогами

После того как я прочитал реальные промты — список меняется. Не нужно «писать всё заново», нужно прицельно докрутить:

### P0 — без этого Opencode выполнит план «как-то», но мусором

1. **`AGENTS.md` в корне** — мастер‑правила для всех агентов (Opencode читает первым делом). Включает:
   - стек‑truth (Next 15 / React 19 / TS5 / Drizzle / Clerk / Stripe / next‑intl / Upstash / Turnstile),
   - locales decision (en only? en+ru+uk?),
   - forbidden vocabulary list (грепаемый),
   - DoD и формат ответа агента.
2. **`prompts/META/INDEX.md`** — порядок исполнения и таблица «когда какой блок отменяет какой». Например:

   ```
   B03.03 (empty schemas) ←超 superseded by step-2/README.md
   B04.01–06 (auth scaffold) ←superseded by step-3/01-auth-clerk/*
   B05.01–06 (stripe scaffold) ←superseded by step-3/02-stripe-billing/*
   ```

3. **`prompts/META/PROMPT-GUIDELINES.md`** — обязательные секции в каждом шаге: `Inputs / Steps / Files / Outputs / Acceptance / Rollback / Verification command`.
4. **`prompts/META/NAMING-CONVENTIONS.md`** — имена файлов/таблиц/роутов/переменных/audit‑actions (`USER_CREATE`, `BUSINESS_PUBLISH`, …). Сейчас они появляются по ходу промтов, и в разных местах будут разные.
5. **`prompts/META/STYLE-GUIDE.md`** — тон промта (английский, императив, без markdown‑декораций в коде, какие комментарии оставлять).
6. **`prompts/META/CONTRIBUTING.md`** — как добавить новый блок (нумерация, шаблон, кто ревьюит).
7. **`.opencode/config.json`** — модель, разрешённые инструменты (read, edit, bash, sql), запрещённые (`rm -rf`, `DROP`, `TRUNCATE`), MCP‑серверы.
8. **`.opencode/commands/`** — слэш‑команды `/run-block B05`, `/verify-schema`, `/migrate`, `/seed`.
9. **`.cursor/rules/*.mdc`** — 10 файлов, как я писал в прошлом ответе. (Cursor и Opencode читают разное; AGENTS.md «один на всех» не работает на 100%, потому что Cursor 0.45+ предпочитает `.cursor/rules/`.)
10. **`CLAUDE.md`** — симлинк/копия AGENTS.md плюс claude‑specific (формат diff, контекст).
11. **`.github/copilot-instructions.md`** — короткие репо‑wide подсказки.
12. **`.nvmrc` (20.18.0 LTS)**, **`.tool-versions`**, **`.editorconfig`** — детерминизм рантайма.

### P1 — нужно в первую неделю

1. **`docs/ARCHITECTURE.md`** — C4 уровни 1–3 (контекст, контейнеры, компоненты). Подавать в контекст агента вместо «угадай где лежит admin».
2. **`docs/DATA-MODEL.md`** — Mermaid ERD (есть код, нет диаграммы). Без ERD ревью schema на глаз = больно.
3. **`docs/API.md`** — реестр всех Server Actions + Route Handlers (Method, путь, auth, role, Zod, returns, side effects). Сейчас они размазаны по 30+ промтам.
4. **`docs/SECURITY.md` + `SECURITY.md` (root)** — CSP, Turnstile, rate‑limit policy, PII‑map, disclosure.
5. **`docs/RUNBOOK.md`** — все pnpm‑скрипты, Stripe CLI, Supabase pooler params, локальный seed, как смотреть webhook‑replay.
6. **`docs/ENV.md`** + **рабочий `.env.example`** — список ВСЕХ переменных (с примерами и owner‑ом).
7. **`docs/I18N.md`** — `single locale (en) MVP, +RU/UK roadmap` или `RU/EN/UK at launch` — решение принять сейчас.
8. **`docs/BILLING-FLOWS.md`** — state machine подписки (Stripe status → memberships.status), grace periods, dunning.
9. **`docs/GLOSSARY.md` + `docs/GUARDRAILS.md`** — словарь и список запрещённых терминов (грепаемый в CI).
10. **`docs/TESTING.md`** — Vitest + Playwright + Stripe CLI mock’и (B16 уже частично решает).
11. **`docs/NFR.md`** — LCP/INP/Lighthouse/WCAG/SLO.
12. **`docs/LEGAL-PARAMS.md`** — юр.лицо, штат, governing law, контакты (B13 это пишет, но в копии).

### P2 — до релиза

1. PR/Issue templates, CODEOWNERS, Renovate, CI с грепом запрещённого словаря, sitemap/robots verification, OG‑превью валидатор.

---

## 3. Rules / Skills / AGENT.md — что прописать **до** первого `opencode run`

### `AGENTS.md` (минимально жизнеспособный, под этот репо)

```md
# AGENTS.md — KYLYVNYK CLUB (kclub-mvp)

## Sources of truth (в порядке приоритета)

1. /docs/SPEC.md (product) — never override
2. /docs/STACK-DECISION.md (ADR) — overrides anything else on stack questions
3. /prompts/META/INDEX.md — execution order; later phases supersede earlier ones
4. /prompts/META/step-2-drizzle-ddl/README.md — DDL truth (replaces B03.03)
5. /prompts/META/step-3-implementations/\* — replaces B04/B05/B09/B10/B11/B12 scaffolds

## Stack (фиксированный)

Next.js 15 App Router, React 19, TypeScript 5 strict, Tailwind v4,
Drizzle ORM (drizzle-orm ^0.36, drizzle-kit ^0.28),
Postgres on Supabase (connection string only),
Clerk ^6 (auth() is async!), Stripe ^17 (apiVersion '2025-...' — pin in /lib/stripe/config),
next-intl ^3, Upstash Redis, Cloudflare Turnstile,
Sentry, Plausible, Node 20 LTS, pnpm 9.

## Forbidden vocabulary (CI‑checked)

MLM | affiliate | referral commission | passive income | earnings |
bonus per user | wallet | investment | guaranteed savings | crypto |
gambling | casino | adult | firearms.
Allowed: "Business Introduction" (noun phrase only).

## Behaviour

- Never invent file paths. If `@/db/schema/...` is referenced but does not exist, STOP and report.
- Every Server Action: zod input, auth check, Turnstile when public, rate-limit, audit log.
- Public route /verify-card returns ONLY: number, memberName, memberType, status, expiresAt — enforce via DTO and a Playwright assertion.
- Stripe webhook: signature verify → stripe_events insert (idempotency) → handler → mark done. No exceptions.
- For new env var: append to /.env.example AND /docs/ENV.md in the same diff.
- Migrations are append-only. No destructive `drizzle-kit drop` without explicit human OK.
- Default output format: unified diff. New files: full content in code fences.
- If a step contradicts another prompt — quote both, choose by INDEX.md precedence, and explain.

## DoD per step

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` green
- Acceptance criteria of the prompt verified
- Files outside of "Files to add/modify" — none unless explained
- Docs/env updated where applicable
```

### Skills (по одному файлу в `.cursor/rules/` или `.opencode/skills/`)

| Файл                         | Что регулирует                                                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `01-rsc-vs-client.mdc`       | Когда RSC, когда `'use server'`, когда `'use client'`                                                                 |
| `02-drizzle-patterns.mdc`    | Имена индексов, enum‑ы, `relations()`, как избегать circular imports                                                  |
| `03-clerk-v6.mdc`            | `auth()` async, middleware matcher, role resolution via DB                                                            |
| `04-stripe-v17.mdc`          | `apiVersion` pin, items‑level `current_period_end`, idempotency через `stripe_events.event_id`, retries 5×exponential |
| `05-next-intl-v3.mdc`        | namespaces, plural rules, locale routing strategy                                                                     |
| `06-zod-validation.mdc`      | schema-first, `safeParse`, mapping to typed `Result<T,E>`                                                             |
| `07-tailwind-v4.mdc`         | tokens, no arbitrary colors, dark‑first, gold accents                                                                 |
| `08-public-routes-pii.mdc`   | DTO для каждого публичного роута + Playwright assertion на список полей                                               |
| `09-security-headers.mdc`    | CSP, HSTS, X‑Frame, Turnstile, Upstash rate‑limit decorator                                                           |
| `10-legal-copy.mdc`          | словарь + CI грэп + проверки в Playwright                                                                             |
| `11-supabase-pg-pooling.mdc` | `?pgbouncer=true&connection_limit=1`, `prepare: false` для postgres‑js                                                |

---

## 4. Какие проблемы возникнут в процессе разработки

Я снимаю прежние пункты, которые уже закрыты промтами (стек, Stripe webhooks idempotency, RBAC, PII в verify-card, B19 seeds, B14 security, B17 observability, B18 CI/CD — это всё есть как блоки). Оставляю и добавляю **те, что реально остались**:

| #   | Проблема                                                                                                                                                                                | Источник риска               | Митigation                                                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | **Дублирование промтов между фазами** (B03 vs step‑2, B04 vs step‑3/01, B05 vs step‑3/02). Агент выберет «верхнюю» версию.                                                              | Архитектура промт‑библиотеки | INDEX.md с precedence + явные `Superseded-By:` хедеры в старых файлах. **Самый высокий приоритет.**                                  |
| R2  | **Версии SDK уйдут вперёд за период между прочтением промта и его исполнением** (Clerk async auth уже сейчас, Stripe items‑level period_end, Next 15.x минорные).                       | Внешние зависимости          | Pin versions в `package.json` exact. Запрет агенту делать `pnpm add x` без указания версии.                                          |
| R3  | **Локализация RU/EN/UK не отражена в коде**: B15 делает single‑locale en.                                                                                                               | Расхождение ТЗ ↔ промты      | До B06 решить: single или multi. Если multi — переписать `i18n/config.ts` и роутинг `[locale]`.                                      |
| R4  | **Profiles.countryId varchar vs businesses.countryId integer** → нельзя джойнить.                                                                                                       | DDL в step‑2                 | Исправить **до** первой миграции. Я бы делал integer FK у profiles тоже.                                                             |
| R5  | **Circular imports внутри schema** (`user.ts` импортирует `profiles` из себя; `audit.ts ↔ user.ts`).                                                                                    | DDL в step‑2                 | Разнести `relations()` в отдельный файл `schema/relations.ts`.                                                                       |
| R6  | **Memberships history теряется** при `onConflictDoUpdate`.                                                                                                                              | step‑2 + B05.04              | Либо отдельная `membership_history`, либо ужесточить semantics («одна строка на user×type»). Прописать в SPEC и в guidelines.        |
| R7  | **Stripe `current_period_end` на корне Subscription** удалён в актуальном API.                                                                                                          | B05.04                       | В `lib/stripe/config.ts` зафиксировать `apiVersion`, в handler читать через `items.data[0].current_period_end`. Покрыть юнит‑тестом. |
| R8  | **Карта /verify-card кеширована 120с, но не инвалидируется при admin‑update**.                                                                                                          | B10.03                       | revalidateTag(`card:<number>`) + триггер в admin‑actions.                                                                            |
| R9  | **Энумерация номеров карт** через предсказуемый формат.                                                                                                                                 | B10.01 + B10.03              | (а) убедиться, что номер содержит достаточную энтропию или HMAC, (б) Turnstile на форме, (в) Upstash rate‑limit IP+number.           |
| R10 | **Стейт‑машина Introductions** свободная (любой статус ↔ любой).                                                                                                                        | B12.05                       | Таблица допустимых переходов + аудит каждого.                                                                                        |
| R11 | **Supabase + Drizzle**: prepared statements ломаются при pgBouncer.                                                                                                                     | Стек                         | `postgres-js` с `prepare: false` или `pg` с верными pool‑настройками. Зафиксировать в RUNBOOK.md.                                    |
| R12 | **Clerk webhooks vs DB user upsert race** (Clerk `user.created` приходит раньше, чем юзер успел залогиниться в приложении).                                                             | B04.03                       | Подписаться на Clerk webhooks и upsert через них, а не лениво при первом запросе.                                                    |
| R13 | **CSP блокирует Clerk/Stripe iframes**.                                                                                                                                                 | B14.03                       | Точный allowlist для `frame-src`/`script-src` `*.clerk.accounts.dev`, `js.stripe.com`. Прописать в `security-headers.mdc`.           |
| R14 | **i18n‑keys drift между RU/EN/UK**.                                                                                                                                                     | если переходим на multi      | CI скрипт `pnpm i18n:diff` + missing‑key fail.                                                                                       |
| R15 | **Step‑1 promotes B03 «empty schemas», step‑2 уже даёт реальные** — кто‑то прогонит B03 и затрёт DDL.                                                                                   | Промт‑порядок                | INDEX.md + B03 явная пометка `do not generate columns here; columns live in step-2`.                                                 |
| R16 | **Партнёрские offers могут уйти в `PUBLIC`** через форму создания, что нарушит ТЗ.                                                                                                      | step-3/04                    | Поле `visibility` редактируется только админом. На уровне Zod + role check.                                                          |
| R17 | **PII в Sentry**. Stripe payload, email‑ы, IP — попадут в issues.                                                                                                                       | B17                          | `beforeSend` scrubber, `denyUrls`, маскировка PII.                                                                                   |
| R18 | **`docs/SPEC.md` на русском**, AI агент при подаче в Claude/Codex локально переведёт термины («Business Introduction» → «business referral»).                                           | SPEC.md                      | Дать в каждом сообщении агенту **EN** SPEC (отдельный `SPEC.en.md`), а русский держать как клиентский.                               |
| R19 | **`isTopPartner` + `isRecommended` руками** vs ranking algorithm.                                                                                                                       | step-2                       | OK для MVP, но это будущий «merge‑boss»: один админ нажал, другой откатил. Аудит обязателен.                                         |
| R20 | **Idempotency в Stripe handler** работает только если `markEventStart` действительно пройдёт. Сейчас при unique‑violation идёт `// proceed` без проверки, обработано ли событие раньше. | B05.04                       | Заменить try/catch на `INSERT ... ON CONFLICT DO NOTHING RETURNING id`. Если ничего не вернулось — выйти.                            |

---

## 5. SPEC.md — обновлённые корректировки

Прошлые 12 пунктов остаются, но с поправкой на то, что часть уже реализована в промтах. Конкретные действия:

1. **Принять STACK-DECISION ADR.** Сейчас в промтах де‑факто принят Clerk + Drizzle + monolith Next (не Turborepo). В вашем ТЗ — Turborepo + Supabase Auth. Один из двух источников надо привести в соответствие. Моя рекомендация: оставить как в промтах (Clerk + Drizzle на Supabase Postgres), **убрать monorepo из ТЗ**, потому что на MVP при single‑app он избыточен.
2. **Принять I18N‑decision.** SPEC + промты живут как `en`-only, ТЗ требует RU/EN/UK. Дописать в SPEC отдельный раздел: «MVP: en. Phase‑2 (post‑launch): ru, uk» — или поднять на старте.
3. **Phantom поля в SPEC.** SPEC говорит «карта, статус, типы», но не описывает `partnerOffers.visibility`, `businesses.isTopPartner/isRecommended`, `auditLogs`. Эти сущности появились в промтах. Перенести их в SPEC как часть домена.
4. **Membership history semantics.** Принять решение: «одна активная строка на (user, type)» vs «история всех изменений». От него зависит и индекс, и поведение `onConflictDoUpdate`. Описать в SPEC.
5. **State machine Introductions.** Описать допустимые переходы и кто их инициирует.
6. **PII contract verify‑card.** SPEC уже хороший, но добавить «не индексируется поисковиками (`robots noindex`), не отображается в Open Graph, не логируется в Sentry».
7. **High‑risk vertical filter.** SPEC перечисляет категории, промты добавили `B14.06-high-risk-category-filters`. В SPEC сделать ссылку: «реализация — B14.06, список ведётся в `src/lib/compliance/forbidden-categories.ts`».
8. **NFR/SLO раздел** — всё ещё отсутствует. Конкретные цифры.
9. **Legal params** (entity, state, governing law) — отсутствуют.
10. **Glossary** — отсутствует.
11. **«Premium dark + gold» как дизайн‑решение** должно быть в SPEC, а не только в B02. Сейчас оно «застряло» в имплементационных промтах.
12. **Версии зависимостей** — отдельная таблица в SPEC или в STACK-DECISION.

Ясность цели и функционала в SPEC: **высокая** — позиционирование, роли, статусы, юридические гард‑рейлы понятны. Ясность контрактов (схемы, API, NFR): **средняя‑низкая** — большая часть фактически живёт в промтах, что плохо для онбординга нового разработчика.

---

## 6. Пояснения по решениям

Кратко, почему я расставил приоритеты именно так:

- **Почему `AGENTS.md` и `INDEX.md` это P0**, а не «приятно бы добавить»: у вас в репо одновременно 3 версии Stripe billing (B05 scaffold, step‑3/02 implementation, и DDL для подписок в step‑2). Без явного precedence агент будет применять ту, что выше в контексте — и каждый ран будет давать разный результат. Это **главная причина нестабильности AI‑бутстрапа**, не качество промтов.
- **Почему я отдельно выделил Clerk v6 / Stripe v17**: это **сейчас**, прямо в момент моего ревью, ломает 2 ваших промта без модификации. Это не теоретический риск, это уже факт.
- **Почему `STACK-DECISION.md` важнее, чем 19 блоков B**: если на полпути выясняется, что вы хотите Supabase Auth + Turborepo, придётся переписать B04, B06, B11, B12 и половину `lib/`. Лучше за 1 час принять решение, чем за неделю переписывать.
- **Почему я не требую переписать SPEC под EN**: текущий русский SPEC — это **продуктовый** документ для клиента/правового. Параллельный EN‑SPEC для агента — дешевле и безопаснее, чем единый.
- **Почему верификация карты — отдельный риск с 3 пунктами (PII / кеш / энумерация)**: это **единственная публичная точка с DB‑доступом** в системе, и она в SPEC прописана как ключевой trust‑механизм. Любая её утечка убивает позиционирование «private club, no PII».
- **Почему я не пишу «всё переделать»**: вы реально хорошо разнесли блоки и форматы. Не нужно ломать структуру — нужно зашить рельсы (META‑файлы + AGENTS.md + INDEX precedence) и поправить 6–8 точечных багов в промтах.

---

## 7. Итоговая сводная таблица — что нужно добавить/исправить до старта

Легенда: **State**: ✅ есть · 🟡 частично · ❌ нет · ⚠️ нужен фикс.

| #   | Артефакт                               | Путь                                           | Priority | State         | Действие                                                            |
| --- | -------------------------------------- | ---------------------------------------------- | -------- | ------------- | ------------------------------------------------------------------- |
| 1   | Project README                         | `/README.md`                                   | P0       | ❌            | Создать (5 экранов: что, стек, quickstart, ссылки на docs, agents). |
| 2   | AGENTS.md                              | `/AGENTS.md`                                   | P0       | ❌            | Создать по шаблону §3.                                              |
| 3   | INDEX.md промт‑библиотеки + precedence | `/prompts/META/INDEX.md`                       | P0       | ⚠️ 0 байт     | Карта Phase‑1/2/3, какой блок отменяет какой.                       |
| 4   | STYLE-GUIDE.md                         | `/prompts/META/STYLE-GUIDE.md`                 | P0       | ⚠️ 0 байт     | Тон, формат, IDE-friendly.                                          |
| 5   | NAMING-CONVENTIONS.md                  | `/prompts/META/NAMING-CONVENTIONS.md`          | P0       | ⚠️ 0 байт     | Файлы, таблицы, audit‑actions, env.                                 |
| 6   | PROMPT-GUIDELINES.md                   | `/prompts/META/PROMPT-GUIDELINES.md`           | P0       | ⚠️ 0 байт     | Inputs/Outputs/Rollback/Verification.                               |
| 7   | CONTRIBUTING.md промтов                | `/prompts/META/CONTRIBUTING.md`                | P1       | ⚠️ 0 байт     | Как добавлять новый блок.                                           |
| 8   | STACK-DECISION ADR                     | `/docs/STACK-DECISION.md`                      | P0       | ❌            | Clerk vs Supabase Auth; Turborepo y/n; locales.                     |
| 9   | DATA-MODEL.md (Mermaid ERD)            | `/docs/DATA-MODEL.md`                          | P0       | ❌            | Визуализировать step‑2 DDL.                                         |
| 10  | API.md (реестр actions/routes)         | `/docs/API.md`                                 | P0       | ❌            | Собрать из всех B-блоков.                                           |
| 11  | I18N.md                                | `/docs/I18N.md`                                | P0       | ❌            | Решить en‑only или en+ru+uk; URL strategy.                          |
| 12  | ENV.md + рабочий .env.example          | `/docs/ENV.md` + `/.env.example`               | P0       | ⚠️ 0 байт     | Все переменные из всех промтов.                                     |
| 13  | RUNBOOK.md                             | `/docs/RUNBOOK.md`                             | P0       | ❌            | pnpm‑скрипты, Stripe CLI, Supabase pooler, seed, replay.            |
| 14  | SECURITY.md (proj + root)              | `/docs/SECURITY.md`, `/SECURITY.md`            | P0       | ❌            | CSP allowlist, Turnstile, rate‑limit, PII, disclosure.              |
| 15  | GUARDRAILS.md (forbidden vocab)        | `/docs/GUARDRAILS.md`                          | P0       | ❌            | Грепаемый список + CI‑чек.                                          |
| 16  | GLOSSARY.md                            | `/docs/GLOSSARY.md`                            | P0       | ❌            | Bus. Introduction, VIP, FREE, Verify Card.                          |
| 17  | BILLING-FLOWS.md                       | `/docs/BILLING-FLOWS.md`                       | P1       | ❌            | State machine; grace; dunning.                                      |
| 18  | NFR.md                                 | `/docs/NFR.md`                                 | P1       | ❌            | LCP/INP/Lighthouse/WCAG/SLO.                                        |
| 19  | LEGAL-PARAMS.md                        | `/docs/LEGAL-PARAMS.md`                        | P1       | ❌            | Entity, state, governing law.                                       |
| 20  | ARCHITECTURE.md (C4)                   | `/docs/ARCHITECTURE.md`                        | P1       | ❌            | Контекст→контейнер→компонент.                                       |
| 21  | TESTING.md                             | `/docs/TESTING.md`                             | P1       | 🟡 (есть B16) | Свести B16 в гайд.                                                  |
| 22  | drizzle.config.ts (реальный)           | `/drizzle.config.ts`                           | P0       | ⚠️ 0 байт     | Взять из step‑2 README.                                             |
| 23  | src/db/schema/\*.ts                    | `/src/db/schema/`                              | P0       | ❌            | Закоммитить файлы из step‑2 (с фиксами R4, R5).                     |
| 24  | Opencode config                        | `/.opencode/config.json` + commands/           | P0       | ❌            | Модель, tools allowlist, slash‑команды.                             |
| 25  | Cursor rules                           | `/.cursor/rules/01..11.mdc`                    | P0       | ❌            | 11 файлов, см. §3.                                                  |
| 26  | CLAUDE.md                              | `/CLAUDE.md`                                   | P1       | ❌            | Симлинк/копия AGENTS.md.                                            |
| 27  | Copilot instructions                   | `/.github/copilot-instructions.md`             | P1       | ❌            | Hints для Copilot.                                                  |
| 28  | Node/tool versions                     | `/.nvmrc`, `/.tool-versions`, `/.editorconfig` | P0       | ❌            | Node 20.18, pnpm 9.x.                                               |
| 29  | CI                                     | `/.github/workflows/ci.yml`                    | P0       | 🟡 (есть B18) | Lint+typecheck+test+build + grep guardrails + i18n‑diff.            |
| 30  | Renovate / Dependabot                  | `/renovate.json` или `/.github/dependabot.yml` | P1       | ❌            | Контроль bleeding‑edge стека.                                       |
| 31  | PR/Issue templates, CODEOWNERS         | `/.github/...`                                 | P2       | ❌            | Чек‑листы (security/i18n/tests/docs).                               |
| 32  | Точечные фиксы в существующих промтах  | 6 файлов                                       | P0       | ⚠️            | См. таблицу 1.2 (R4, R5, R6, R7, R8, R9, R12, R16, R20).            |
| 33  | SPEC.md корректировки                  | `/docs/SPEC.md`                                | P0       | ⚠️            | Принять §5 пункты 1–12.                                             |

---

## TL;DR — что я сделал бы за 2 рабочих дня перед `opencode run B01`

1. Принять **STACK-DECISION** (Clerk + Drizzle + single Next app, без Turborepo — мой выбор). Записать ADR.
2. Принять **I18N decision** (мой выбор: `en` MVP + roadmap на `ru/uk`).
3. Заполнить `AGENTS.md`, `prompts/META/INDEX.md` с precedence, `STYLE-GUIDE.md`, `NAMING-CONVENTIONS.md`, `PROMPT-GUIDELINES.md`.
4. Применить точечные фиксы в B04.03 (Clerk async), B05.04 (Stripe items‑level + ON CONFLICT DO NOTHING), step‑2 (profiles.countryId integer + вынести relations), B10.03 (no‑store + revalidateTag + rate‑limit + Turnstile).
5. Закоммитить рабочий `.env.example`, `drizzle.config.ts`, `src/db/schema/*` из step‑2.
6. Добавить `.opencode/config.json` + 11 `.cursor/rules/*.mdc` + `.nvmrc`.
7. Запустить CI с грепом forbidden‑vocab и schema‑diff.
8. **Только тогда** запускать `B01 → … → B19 → step-2 → step-3 → step-4`.
