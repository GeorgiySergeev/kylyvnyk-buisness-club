Отлично — это правильное решение. Stripe, subscriptions, payment webhooks — это отдельный complexity multiplier, который можно добавить после того, как base product работает. Сейчас делаем 8 страниц, auth, каталог, введение клиента, admin. Всё.

Ниже: **пересмотренный scope** → **упрощённая схема БД** → **новый порядок блоков** → **детальный playbook для Day 1**.

---

# A. Что входит в MVP — детализация по страницам

| # | Страница | Route | Auth | Что нужно из БД |
|---|---|---|---|---|
| 1 | Главная (до регистрации) | `/en` | public | — |
| 2 | Главная (после регистрации) | `/en` | FREE\|BUS\|ADMIN | users, businesses (featured) |
| 3 | Регистрация участника | `/en/sign-up`, `/en/onboarding` | — / FREE | users, profiles |
| 4 | Личный кабинет | `/en/m/dashboard` | FREE\|BUS | users, profiles, businesses, cards, introductions |
| 5 | Каталог партнёров | `/en/directory` | public + richer if auth | businesses, categories, countries |
| 6 | Карточка партнёра | `/en/directory/[slug]` | public | businesses, partner_offers |
| 7 | Рекомендовать клиента | `/en/m/introduce` | BUS only | introductions |
| 8 | MVP Admin | `/en/admin/*` | ADMIN | все таблицы |

---

# B. Упрощённая схема БД (без Stripe)

Никаких `stripe_events`, `subscriptions`, `memberships`. Роль хранится прямо в `users.role`.

```
users
  id uuid PK
  clerk_user_id text UNIQUE NOT NULL
  email text UNIQUE NOT NULL
  display_name text
  role text NOT NULL  ← 'FREE' | 'BUSINESS' | 'ADMIN'
  status text NOT NULL  ← 'ACTIVE' | 'INACTIVE' | 'BANNED'
  created_at, updated_at, deleted_at

profiles  (только для FREE участников)
  id uuid PK
  user_id uuid FK → users.id UNIQUE
  avatar_url text
  country_id integer FK → countries.id
  city_id integer FK → cities.id
  bio text
  created_at, updated_at

countries
  id serial PK
  name text NOT NULL
  iso2 char(2) UNIQUE NOT NULL
  flag_emoji text

cities
  id serial PK
  name text NOT NULL
  country_id integer FK → countries.id

categories
  id serial PK
  name text NOT NULL
  slug text UNIQUE NOT NULL
  icon text
  parent_id integer FK → categories.id (self-ref)

businesses
  id uuid PK
  user_id uuid FK → users.id
  name text NOT NULL
  slug text UNIQUE NOT NULL
  description text
  logo_url text
  website text
  phone text
  email text
  country_id integer FK → countries.id
  city_id integer FK → cities.id
  category_id integer FK → categories.id
  status text NOT NULL  ← 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'HIDDEN'
  is_top_partner boolean DEFAULT false
  is_recommended boolean DEFAULT false
  created_at, updated_at, deleted_at

club_cards
  id uuid PK
  user_id uuid FK → users.id
  number text UNIQUE NOT NULL  ← VIP-UA-XXXXXXXXXX
  member_type text NOT NULL  ← 'VIP' | 'BUSINESS' | 'FREE'
  status text NOT NULL  ← 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  expires_at timestamptz
  created_at, updated_at

introductions
  id uuid PK
  requester_id uuid FK → users.id  ← кто рекомендует
  target_business_id uuid FK → businesses.id  ← кому рекомендуют
  client_name text NOT NULL
  client_contact text NOT NULL  ← phone или email
  message text
  status text NOT NULL  ← 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CLOSED'
  admin_note text
  created_at, updated_at

audit_logs
  id uuid PK
  actor_user_id uuid FK → users.id
  action text NOT NULL  ← 'USER_CREATE', 'BUSINESS_PUBLISH', 'INTRODUCTION_APPROVE' ...
  entity_type text
  entity_id text
  payload jsonb
  ip_address text
  created_at
```

---

# C. Новый порядок блоков (MVP без Stripe)

Stripe-блоки (B05) исключаем полностью. Остальные переупорядочены под конкретные 8 страниц.

| Этап | Блок | Что делаем | Страницы |
|---|---|---|---|
| **Foundation** | B01 | Next.js 15 + TS + ESLint + Prettier + Tailwind v4 + shadcn | — |
| | B02 | Dark/gold дизайн-система, токены, layout компоненты | Все |
| | B03 | Drizzle config + упрощённая схема (9 таблиц выше) + seed данные | — |
| **Auth** | B04 | Clerk v6, middleware, onboarding flow, роли FREE/BUSINESS/ADMIN | стр. 2, 3 |
| **Routing** | B06 | next-intl en, `[locale]` routing, protected routes | все |
| **Pages** | B08 | Home страница до/после регистрации | стр. 1, 2 |
| | B09 | Каталог партнёров + карточка | стр. 5, 6 |
| | B11 | Личный кабинет | стр. 4 |
| | B07 | Форма «Рекомендовать клиента» | стр. 7 |
| **Admin** | B12-MVP | Минимальная admin-панель | стр. 8 |
| **Polish** | B10 | Club card + verify | стр. 4 part |
| | B19 | Seeds (тестовые данные) | dev |

**Итого: 10 блоков вместо 19.** Время: 2-3 недели плотной работы.

---

# D. Pre-flight Checklist — перед тем как открыть Cursor

Это нужно сделать **один раз руками**. Cursor здесь не поможет — он не знает ваши credentials.

## D.1 Проверить toolchain

```bash
cd /g/KYLYVNYK\ CLUB/kylyvnyk-business-club

# Node
nvm use
node --version
# → должно быть v20.18.x

# pnpm
pnpm --version
# → должно быть 9.15.x
# Если нет: corepack enable && corepack prepare pnpm@9.15.0 --activate
```

## D.2 Создать .env.local

```bash
cp .env.example .env.local
```

Открываете `.env.local` в редакторе и заполняете:

**Supabase** (бесплатный проект на supabase.com):

```bash
# Supabase Dashboard → Project → Settings → Database
# Connection Pooler → Transaction mode → port 6543
DATABASE_URL=postgres://postgres:ВАШ_ПАРОЛЬ@db.ВАШ_PROJECT_REF.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1

# Direct → port 5432
DATABASE_URL_DIRECT=postgres://postgres:ВАШ_ПАРОЛЬ@db.ВАШ_PROJECT_REF.supabase.co:5432/postgres
```

**Clerk** (dev instance на clerk.com → Create application → "kclub-dev"):

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...  # заполним позже, в B04
```

**Upstash** (бесплатный Redis на upstash.com → Create database):

```bash
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

**Turnstile** (тестовые ключи, работают без регистрации):

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

**Остальное** оставьте как есть (SENTRY, PLAUSIBLE, STRIPE — не нужны сейчас).

## D.3 Создать рабочую ветку

```bash
git checkout main
git pull
git checkout -b feat/mvp-foundation
```

Готово. Открываете Cursor.

---

# E. Day 1 Playbook — B01 полностью

## Как работать с Cursor Agent

- Открываете **Cmd+I** (Mac) / **Ctrl+I** (Win) — это Composer/Agent режим.
- Режим должен быть **Agent**, не "Chat". В Agent'е он может читать файлы и предлагать изменения.
- Каждый раз когда агент предлагает изменение файла — вы видите diff. **Читаете.** Потом Accept или Reject.
- Никогда не нажимайте "Accept All" не читая.

---

## Шаг E.1 — Ориентация агента (5 минут, один раз)

Вставьте в Cursor Agent дословно:

```
Read these files without making any changes:
1. /AGENTS.md
2. /prompts/META/INDEX.md
3. /docs/STACK-DECISION.md

Then tell me:
- In 3 sentences: what is this project?
- What is the tech stack (framework, DB, auth, styling)?
- What is forbidden vocabulary?
- What does `auth()` return in Clerk v6 — sync or async?

No code, no changes. Just answer.
```

**Что ожидаете увидеть в ответе:**
- "Private business club platform" — правильно
- "Next.js 15, Drizzle, Clerk v6, Tailwind v4" — правильно
- "MLM, affiliate, referral commission..." — правильно
- "`auth()` returns a Promise, must be awaited" — правильно

**Если агент говорит что-то другое** — стоп. Проверьте, что AGENTS.md не пустой (`wc -c AGENTS.md` в терминале). Если пустой — значит коммит не дошёл, возвращайтесь к шагу из нашей предыдущей работы.

---

## Шаг E.2 — B01.01: Инициализация Next.js (20-30 минут)

Вставьте в Cursor Agent:

```
Read /prompts/META/step-1-blocks/B01-project-bootstrap/01-init-nextjs-ts-eslint-prettier.md

We are building the MVP described in AGENTS.md. Stripe is NOT part of this MVP.

Current repo state:
- The repo is NOT a blank Next.js app yet. It only has docs/ and prompts/ folders.
- Node 20.18.0, pnpm 9.15.0
- We need Next.js 15 App Router, React 19, TypeScript 5 strict
- Tailwind v4 (CSS-first, NOT tailwind.config.ts)
- src/ directory structure (not app/ at root level — use src/app/)

Before making changes, show me:
1. The complete list of files you will create or modify
2. The exact pnpm command to scaffold Next.js

Then wait for my approval.
```

**Агент должен ответить примерно так:**

```
Files to create:
- package.json
- tsconfig.json
- next.config.ts
- src/app/layout.tsx
- src/app/globals.css
- src/app/page.tsx
- .eslintrc.json (or eslint.config.mjs for flat config)
- .prettierrc
- .prettierignore

Command:
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias
```

**Проверяете список.** Если там есть `turbo.json` или `pnpm-workspace.yaml` — говорите:

```
We are NOT using Turborepo. Single Next.js app only. Remove turbo.json and pnpm-workspace.yaml from the plan.
```

Если список выглядит правильно:

```
Proceed. Run the scaffold command and show me all file diffs.
```

**Что смотреть в diff'ах:**

`package.json` — критично проверить:

```json
// ✅ должно быть
"next": "15.x.x",
"react": "19.x.x",
"react-dom": "19.x.x",
"typescript": "^5.x.x",

// ❌ не должно быть
"@supabase/supabase-js": ...  // мы не используем
"turbo": ...                   // не Turborepo
```

`tsconfig.json` — проверить strict:

```json
// ✅ должно быть
"strict": true,
"noUncheckedIndexedAccess": true,

// ❌ не должно быть
"strict": false
```

`tailwind.config.ts` — **не должен существовать**. Tailwind v4 — CSS-first, конфиг в `globals.css`. Если агент создал `tailwind.config.ts` — скажите:

```
Tailwind v4 uses CSS-first config. Delete tailwind.config.ts. 
Config goes into src/app/globals.css via @theme directive.
```

**После того как приняли все diff'ы — выполните:**

```bash
pnpm install
# ждёте ~2-3 минуты

pnpm dev
# открываете http://localhost:3000
# должна быть базовая Next.js страница
```

Если `pnpm dev` стартует и страница открывается — **хорошо**.

```bash
# Ctrl+C (стоп dev server)
pnpm typecheck
# → должно быть exit 0, никаких ошибок

pnpm lint
# → могут быть warnings, не должно быть errors
```

**Коммит:**

```bash
git add .
git commit -m "feat(b01): scaffold Next.js 15 + React 19 + TS strict + Tailwind v4"
```

---

## Шаг E.3 — B01.02: Tailwind v4 дизайн-токены (15 минут)

Вставьте в Cursor Agent:

```
Now let's set up Tailwind v4 design tokens for KCLUB.

The design is dark-first (near-black background, gold accent). 
No light mode in MVP.

Modify src/app/globals.css to:
1. Use @import "tailwindcss" at the top (Tailwind v4 CSS-first)
2. Add @theme block with these tokens:
   - bg: #0a0a0b (page background)
   - surface: #16161a (card background) 
   - surface-2: #1f1f25 (elevated card)
   - border: #2a2a32
   - fg: #f5f5f0 (primary text)
   - fg-muted: #a8a8a0 (secondary text)
   - accent: #d4af37 (gold)
   - accent-hover: #e6c14a
   - danger: #ef4444
   - success: #22c55e
   - font-sans: Inter, system-ui, sans-serif
   - font-display: "Playfair Display", Georgia, serif

3. Add base body styles: bg-bg text-fg font-sans antialiased

Show me the diff. No other files.
```

**Что проверять в diff:**

```css
/* ✅ должно быть */
@import "tailwindcss";

@theme {
  --color-bg: #0a0a0b;
  --color-accent: #d4af37;
  /* ... */
}

/* ❌ не должно быть */
@tailwind base;        /* это Tailwind v3 синтаксис */
@tailwind components;
@tailwind utilities;
```

После Accept:

```bash
pnpm dev
# открываете localhost:3000
# фон должен стать тёмным (#0a0a0b)
# текст — светлым (#f5f5f0)
```

Если страница тёмная — отлично.

```bash
git add src/app/globals.css
git commit -m "feat(b01): add dark/gold Tailwind v4 design tokens"
```

---

## Шаг E.4 — B01.03: shadcn/ui setup (20 минут)

Вставьте в Cursor Agent:

```
Set up shadcn/ui for the project.

Requirements:
- shadcn/ui components are COPIED into src/components/ui/ (not registry-imported at runtime)
- Style: "default" shadcn style, adapted to our dark theme tokens
- We need these components for MVP: Button, Input, Label, Card, 
  Badge, Avatar, Dialog, Dropdown, Table, Textarea, Select, Separator, Skeleton

Run the shadcn init command and then add the listed components.
Show me the command first, then the files diff.
```

Агент предложит:

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input label card badge avatar dialog dropdown-menu table textarea select separator skeleton
```

Эти команды в нашем denylist'е (`pnpm dlx *`), потому что они интерактивные и скачивают код из сети. Это исключение — скажите агенту:

```
I'll run these commands manually. Please show me what options to select 
during `shadcn init` for our dark theme setup.
```

Агент объяснит. Вы **сами в терминале** запускаете:

```bash
pnpm dlx shadcn@latest init
# Интерактивные вопросы:
# Style → Default
# Base color → Neutral  
# CSS variables → Yes

pnpm dlx shadcn@latest add button input label card badge avatar dialog dropdown-menu table textarea select separator skeleton
```

После этого у вас появится `src/components/ui/*.tsx`.

Скажите агенту:

```
shadcn components are now in src/components/ui/. 
Verify that:
1. Button component exists and uses our --color-accent token for the primary variant
2. All components use CSS variables (not hardcoded colors)
3. components.json is in the root

Show me if any component needs updating to use our gold accent color for primary buttons.
```

Агент проверит и предложит правку Button компонента — `bg-primary` должен маппиться на `var(--color-accent)`. Примите если выглядит правильно.

```bash
pnpm typecheck
# → 0 errors

pnpm lint
# → 0 errors

git add .
git commit -m "feat(b01): add shadcn/ui with dark theme adaptation"
```

---

## Шаг E.5 — B01.04: Базовая структура папок (10 минут)

Вставьте в Cursor Agent:

```
Create the base folder structure for the project. 
Create empty index files where needed to establish the structure.

Required structure (from NAMING-CONVENTIONS.md):

src/
  app/
    (public)/           ← public routes group
    (auth)/             ← auth pages group  
    [locale]/           ← locale-prefixed routing (we'll wire this in B06)
      (marketing)/      ← home, about etc
      (member)/m/       ← member dashboard
      (business)/b/     ← business area
      admin/            ← admin panel
    api/
      clerk/webhook/
      stripe/webhook/   ← placeholder only, Stripe not in MVP
  components/
    ui/                 ← already exists (shadcn)
  features/
    auth/
      actions/
      components/
      schemas/
    directory/
      actions/
      components/
      schemas/
    introductions/
      actions/
      components/
      schemas/
    admin/
      actions/
      components/
      schemas/
  lib/
    auth/
    rate-limit/
    captcha/
    log.ts
    env.ts
  db/
    schema/
    client.ts
  i18n/
  styles/

Create .gitkeep files in empty folders.
Create src/lib/env.ts as a typed Zod env loader (read AGENTS.md §3 for the required env vars).
Create src/lib/log.ts as a minimal logger wrapper.

Show me all files before creating.
```

**Что проверять в diff:**

- `src/lib/env.ts` — должен использовать `zod` для валидации env. Если агент просто написал `export const env = process.env` — отклоните:

```
env.ts must use zod to validate env vars at startup and fail fast 
with a clear error listing missing vars. Show me the zod schema approach.
```

- `src/lib/log.ts` — должен быть простой wrapper, не `console.log`:

```ts
// ✅ примерно так
export const log = {
  info: (msg: string, ctx?: object) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(JSON.stringify({ level: 'info', msg, ...ctx }));
    }
  },
  error: (msg: string, ctx?: object) => {
    console.error(JSON.stringify({ level: 'error', msg, ...ctx }));
  },
};
```

```bash
pnpm typecheck
# → 0 errors

git add .
git commit -m "feat(b01): establish project folder structure + env loader + logger"
```

---

## Шаг E.6 — Финальная проверка B01 (5 минут)

```bash
# Запустить полный gate
pnpm lint && pnpm typecheck && pnpm build

# Ожидаем:
# lint → 0 errors (warnings OK)
# typecheck → 0 errors
# build → ✓ Compiled successfully
```

Если всё зелёное:

```bash
git log --oneline
# должно быть 4 коммита:
# feat(b01): establish project folder structure + env loader + logger
# feat(b01): add shadcn/ui with dark theme adaptation
# feat(b01): add dark/gold Tailwind v4 design tokens
# feat(b01): scaffold Next.js 15 + React 19 + TS strict + Tailwind v4
```

---

# F. Что делать если что-то пошло не так

## Агент создал файл не в том месте

```
This file should be at src/lib/env.ts, not lib/env.ts. 
Move it and update all imports accordingly.
```

## Агент добавил `"use client"` туда, где не нужно

```
This file reads from the database / calls auth(). 
It must be a Server Component or Server Action, not a client component.
Remove "use client" and make it server-only.
```

## `pnpm typecheck` выдаёт ошибки

Скопируйте ошибки в Cursor и напишите:

```
Fix these TypeScript errors. Do not use `any` or `@ts-ignore`.
Show me the diff.

[вставьте ошибки]
```

## `pnpm build` падает с ошибкой Tailwind

```
We use Tailwind v4 CSS-first config.
There should be NO tailwind.config.ts.
Config lives in src/app/globals.css via @theme directive.
Fix accordingly.
```

## Агент предлагает установить новую библиотеку

```
Do not add new dependencies. Solve this with existing packages.
If you must add a dependency, tell me the exact package name and version 
and explain why nothing existing works.
```

---

# G. B02 — что делать следующим (краткий план)

После того как B01 зелёный и закоммичен, пишете в Cursor:

```
B01 is complete and green. 
Now let's do B02: design system components.

Read /prompts/META/step-1-blocks/B02-design-system/

We need:
1. Base layout component with header + footer
2. Header: logo (text "KCLUB"), navigation links, auth state (sign-in button or avatar)
3. Footer: minimal with legal text from SPEC.md
4. Page wrapper component with consistent max-width and padding
5. The header must show different nav depending on auth state:
   - Not logged in: "Directory", "Verify Card", "Sign In", "Join Now"
   - Logged in (FREE): "Directory", "Dashboard", "Sign Out"
   - Logged in (BUSINESS): "Directory", "Dashboard", "Recommend Client", "Sign Out"
   - ADMIN: all above + "Admin"

No Stripe links anywhere.
Show me the plan first — what files will you create?
```

---

# H. Сводная таблица — ритм работы на каждый день

| День | Блок | Страницы готовы | Коммиты |
|---|---|---|---|
| 1 | B01 | Next.js рабочий | 4 |
| 2 | B02 | Layout, Header, Footer | 3-4 |
| 3 | B03 | DB схема + миграции | 3-4 |
| 4 | B04 | Sign-in, Sign-up, Onboarding | 4-5 |
| 5 | B06 | i18n routing, protected routes | 2-3 |
| 6-7 | B08 | Home до/после логина | 4-5 |
| 8-9 | B09 | Каталог + карточка партнёра | 5-6 |
| 10 | B11 | Личный кабинет | 4-5 |
| 11 | B07 | Форма «Рекомендовать клиента» | 3-4 |
| 12-14 | B12-MVP | Admin panel | 6-8 |
| 15 | B10 + B19 | Club card + seeds | 3-4 |

**Итого: ~15 рабочих дней до рабочего MVP с 8 страницами.**

---

# Самое важное — одно правило на весь период

> **Один шаг → один `pnpm verify` → один коммит.**

Не накапливайте несколько шагов без коммита. Если агент поломал что-то на шаге 3, а вы уже начали шаг 5 — откат будет болезненным. `git commit` после каждого зелёного `pnpm verify` — это ваша сеть безопасности.

Скажите «готов» когда запустится `pnpm dev` и покажет тёмную страницу — значит B01 пошёл как надо, и переходим к B02.