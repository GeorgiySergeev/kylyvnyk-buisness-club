# B03 — Database Schema + Drizzle Migrations Playbook

Перед стартом:

```bash
git checkout main && git pull
git checkout -b feat/b03-database-schema

# убедиться что предыдущий build чистый
pnpm lint && pnpm typecheck && pnpm build
# → всё зелёное
```

---

## Что строим в B03

```
B03.01  drizzle.config.ts + db client
B03.02  Enum-файлы (5 enum'ов)
B03.03  Схема таблиц (9 таблиц)
B03.04  _relations.ts (централизованные relations — Patch-05)
B03.05  Первая миграция + применение к Supabase
B03.06  Seed-данные (countries, categories, test businesses, admin user)
B03.07  Финальная проверка
```

На выходе: 9 таблиц живут в Supabase, `pnpm db:studio` показывает их, seed даёт тестовые данные для разработки.

---

## Шаг B03.01 — drizzle.config.ts + DB client

Этот файл сейчас **0 байт** в репо. Начинаем именно с него — без него ничего не работает.

Вставьте в Cursor Agent:

```
Read /docs/STACK-DECISION.md ADR-003 (Database).
Read /prompts/META/PATCHES/Patch-05-drizzle-relations-extract.md.
Read /.cursor/rules/11-supabase-pg-pooling.mdc.

Create the Drizzle configuration and database client.

CRITICAL rules from ADR-003:
- DATABASE_URL (port 6543, PgBouncer) → app runtime, prepare: false
- DATABASE_URL_DIRECT (port 5432, direct) → drizzle-kit only
- NEVER create a second postgres() client anywhere else in the codebase
- All queries go through the single db export from @/db/client

1. drizzle.config.ts (modify — currently 0 bytes, in repo root)
   - dialect: 'postgresql'
   - schema: './src/db/schema/index.ts'
   - out: './drizzle'
   - dbCredentials.url: uses DATABASE_URL_DIRECT from env
   - verbose: true
   - strict: true
   - Use env.DATABASE_URL_DIRECT from src/lib/env.ts

2. src/db/client.ts (modify — currently placeholder)
   - import postgres from 'postgres'
   - import { drizzle } from 'drizzle-orm/postgres-js'
   - import * as schema from './schema'
   - postgres() with DATABASE_URL, prepare: false, max: 10, idle_timeout: 30
   - drizzle(sql, { schema, logger: NODE_ENV === 'development' })
   - export { db, type DB }

3. package.json (modify — add db scripts)
   Add to scripts:
   "db:generate": "drizzle-kit generate"
   "db:migrate": "drizzle-kit migrate"
   "db:push": "echo 'Use db:migrate instead. db:push disabled.' && exit 1"
   "db:studio": "drizzle-kit studio"
   "db:seed": "tsx src/db/seed.ts"

Files to touch:
- drizzle.config.ts (modify)
- src/db/client.ts (modify)
- package.json (modify — scripts only)

Show me all diffs. Be exact — this is critical infrastructure.
```

**Что проверять в diff:**

`drizzle.config.ts`:

```ts
// ✅
import { defineConfig } from 'drizzle-kit';

import { env } from './src/lib/env';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: env.DATABASE_URL_DIRECT, // ← DIRECT, не pooled
  },
  verbose: true,
  strict: true,
});

// ❌ не должно быть
dbCredentials: {
  url: env.DATABASE_URL;
} // pooled URL сломает миграции
```

`src/db/client.ts`:

```ts
// ✅
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const sql = postgres(env.DATABASE_URL, {
  prepare: false,  // ← ОБЯЗАТЕЛЬНО для PgBouncer
  max: 10,
  idle_timeout: 30,
});

export const db = drizzle(sql, { schema: { ...schema }, logger: ... });

// ❌ не должно быть
prepare: true   // сломает под нагрузкой
// или вообще без prepare — тогда дефолт true
```

`package.json` — проверьте `db:push` намеренно отключён:

```json
// ✅ — защита от случайного push против shared DB
"db:push": "echo 'Use db:migrate instead. db:push disabled.' && exit 1"
```

```bash
# установить postgres-js и drizzle-kit если не установлены
# проверяем сначала
cat package.json | grep -E "drizzle|postgres"
# если нет — устанавливаем вручную
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit tsx

pnpm typecheck
# → 0 errors

git add drizzle.config.ts src/db/client.ts package.json pnpm-lock.yaml
git commit -m "feat(b03): drizzle config + db client (pooled + direct URLs, prepare:false)"
```

---

## Шаг B03.02 — Enum файлы

Каждый enum — отдельный файл. SQL enum + TypeScript тип вместе.

Вставьте в Cursor Agent:

```
Read /docs/STACK-DECISION.md and /prompts/META/NAMING-CONVENTIONS.md §3 (Database).

Create 5 Drizzle enum files. All go in src/db/schema/enums/.
Pattern: pgEnum('sql_name', [...values]) + TypeScript type inferred from it.

1. src/db/schema/enums/user-role.ts
   pgEnum('user_role', ['FREE', 'BUSINESS', 'ADMIN'])
   export type UserRole = ...

2. src/db/schema/enums/user-status.ts
   pgEnum('user_status', ['ACTIVE', 'INACTIVE', 'BANNED'])
   export type UserStatus = ...

3. src/db/schema/enums/business-status.ts
   pgEnum('business_status', ['DRAFT', 'PENDING', 'PUBLISHED', 'HIDDEN'])
   export type BusinessStatus = ...

4. src/db/schema/enums/card-status.ts
   pgEnum('card_status', ['ACTIVE', 'INACTIVE', 'EXPIRED'])
   export type CardStatus = ...

   pgEnum('card_member_type', ['VIP', 'BUSINESS', 'FREE'])
   export type CardMemberType = ...

5. src/db/schema/enums/introduction-status.ts
   pgEnum('introduction_status',
     ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED'])
   export type IntroductionStatus = ...

Each file:
- import { pgEnum } from 'drizzle-orm/pg-core'
- export const xxxEnum = pgEnum(...)
- export type Xxx = (typeof xxxEnum.enumValues)[number]

Files to create:
- src/db/schema/enums/user-role.ts
- src/db/schema/enums/user-status.ts
- src/db/schema/enums/business-status.ts
- src/db/schema/enums/card-status.ts
- src/db/schema/enums/introduction-status.ts

Show me all 5 diffs.
```

**Что проверять:**

```ts
// ✅ правильный паттерн
import { pgEnum } from "drizzle-orm/pg-core";
export const userRoleEnum = pgEnum("user_role", ["FREE", "BUSINESS", "ADMIN"]);
export type UserRole = (typeof userRoleEnum.enumValues)[number];

// ❌ не должно быть TypeScript enum keyword
enum UserRole { FREE = "FREE", ... } // не pgEnum — не попадёт в миграцию
```

```bash
pnpm typecheck
# → 0 errors

git add src/db/schema/enums/
git commit -m "feat(b03): Drizzle pg enums (role, status, business, card, introduction)"
```

---

## Шаг B03.03 — Схема таблиц

Это самый большой шаг. Подаём по 2-3 таблицы, не все сразу — чтобы diff был читаемым.

### Группа 1: users + profiles

Вставьте в Cursor Agent:

```
Read /prompts/META/PATCHES/Patch-04-profiles-country-id-integer.md.
Read /prompts/META/PATCHES/Patch-05-drizzle-relations-extract.md.

Create the first two schema files.
IMPORTANT: NO relations() in these files. Relations go in _relations.ts later (Patch-05).
IMPORTANT: profiles.countryId must be integer FK, NOT varchar (Patch-04).

1. src/db/schema/user.ts
   Table name: 'users'
   Columns:
   - id: uuid, primaryKey, defaultRandom()
   - clerkUserId: text, unique, notNull  ← 'clerk_user_id'
   - email: text, unique, notNull
   - displayName: text  ← 'display_name', nullable
   - role: userRoleEnum, notNull, default 'FREE'
   - status: userStatusEnum, notNull, default 'ACTIVE'
   - createdAt: timestamp with timezone, notNull, defaultNow()  ← 'created_at'
   - updatedAt: timestamp with timezone, notNull, defaultNow()  ← 'updated_at'
   - deletedAt: timestamp with timezone, nullable  ← 'deleted_at'

   Indexes:
   - usersClerkUserIdUx: uniqueIndex on clerkUserId
   - usersEmailUx: uniqueIndex on email
   - usersRoleIdx: index on role
   - usersStatusIdx: index on status

2. src/db/schema/profile.ts
   Table name: 'profiles'
   Columns:
   - id: uuid, primaryKey, defaultRandom()
   - userId: uuid, notNull, references users.id onDelete cascade  ← 'user_id'
   - avatarUrl: text  ← 'avatar_url', nullable
   - countryId: integer, nullable, references countries.id onDelete set null  ← 'country_id'
     NOTE: integer FK, not varchar (per Patch-04)
   - cityId: integer, nullable, references cities.id onDelete set null  ← 'city_id'
   - bio: text, nullable
   - createdAt: timestamp with timezone, notNull, defaultNow()
   - updatedAt: timestamp with timezone, notNull, defaultNow()

   Indexes:
   - profilesUserIdUx: uniqueIndex on userId  ← one profile per user
   - profilesCountryIdIdx: index on countryId

NOTE: profile.ts references countries and cities tables that don't exist yet.
Use the table name string directly in references() to avoid import cycles:
  countryId: integer("country_id").references(() => countries.id)
You will need to import countries and cities from their schema files.
This is OK — schema files CAN import each other for FK references.
Only relations() declarations must be centralized.

Files to create:
- src/db/schema/user.ts
- src/db/schema/profile.ts

Show me both diffs.
```

**Что проверять:**

```ts
// src/db/schema/user.ts ✅
import { userRoleEnum } from './enums/user-role';
import { userStatusEnum } from './enums/user-status';

// NO import of profiles here

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clerkUserId: text('clerk_user_id').unique().notNull(),
    // ...
    role: userRoleEnum('role').notNull().default('FREE'),
    status: userStatusEnum('status').notNull().default('ACTIVE'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }), // nullable — нет .notNull()
  },
  (t) => ({
    clerkUserIdUx: uniqueIndex('users_clerk_user_id_ux').on(t.clerkUserId),
    emailUx: uniqueIndex('users_email_ux').on(t.email),
    roleIdx: index('users_role_idx').on(t.role),
    statusIdx: index('users_status_idx').on(t.status),
  }),
);

// ❌ не должно быть relations() в этом файле
// ❌ не должно быть import { profiles } from './profile' здесь
```

```ts
// src/db/schema/profile.ts ✅
countryId: integer("country_id")
  .references(() => countries.id, { onDelete: "set null" }),
// integer FK — НЕ varchar

// ❌ не должно быть
countryId: varchar("country_id", { length: 36 }) // Patch-04 forbids this
```

### Группа 2: countries + cities + categories

```
Create 3 reference data tables.
These are simple lookup tables with no circular dependencies.

1. src/db/schema/country.ts
   Table name: 'countries'
   Columns:
   - id: serial, primaryKey  ← auto-increment integer, not uuid
   - name: text, notNull
   - iso2: char(2), unique, notNull  ← 'iso2', e.g. 'UA', 'US', 'DE'
   - flagEmoji: text, nullable  ← 'flag_emoji', e.g. '🇺🇦'

   Indexes:
   - countriesIso2Ux: uniqueIndex on iso2

2. src/db/schema/city.ts
   Table name: 'cities'
   Columns:
   - id: serial, primaryKey
   - name: text, notNull
   - countryId: integer, notNull, references countries.id onDelete cascade  ← 'country_id'

   Indexes:
   - citiesCountryIdIdx: index on countryId
   - citiesNameCountryUx: uniqueIndex on (name, countryId)  ← prevent duplicate city per country

3. src/db/schema/category.ts
   Table name: 'categories'
   Columns:
   - id: serial, primaryKey
   - name: text, notNull
   - slug: text, unique, notNull
   - icon: text, nullable  ← lucide icon name, e.g. 'coffee', 'laptop'
   - parentId: integer, nullable, references categories.id onDelete set null  ← 'parent_id', self-ref

   Indexes:
   - categoriesSlugUx: uniqueIndex on slug
   - categoriesParentIdIdx: index on parentId

Files to create:
- src/db/schema/country.ts
- src/db/schema/city.ts
- src/db/schema/category.ts

Show me all 3 diffs. No relations() in any of these files.
```

**Что проверять:**

```ts
// country.ts ✅
import { pgTable, serial, text, char, uniqueIndex } from "drizzle-orm/pg-core";
// serial — не uuid, это int auto-increment

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),  // ← serial, не uuid
  iso2: char("iso2", { length: 2 }).unique().notNull(),
  // ...
});

// category.ts — self-reference ✅
parentId: integer("parent_id")
  .references((): AnyPgColumn => categories.id, { onDelete: "set null" }),
// AnyPgColumn нужен для self-reference чтобы избежать circular type
```

Если агент поставил `uuid` вместо `serial` для countries/cities/categories — поправьте:

```
countries, cities, and categories use serial (auto-increment integer)
as primary key, NOT uuid. They are reference data tables.
Fix the id column type to: id: serial("id").primaryKey()
```

### Группа 3: businesses

```
Create the businesses table.

src/db/schema/business.ts
Table name: 'businesses'
Columns:
- id: uuid, primaryKey, defaultRandom()
- userId: uuid, notNull, references users.id onDelete cascade  ← 'user_id'
- name: text, notNull
- slug: text, unique, notNull
- description: text, nullable
- logoUrl: text, nullable  ← 'logo_url'
- website: text, nullable
- phone: text, nullable
- email: text, nullable
- countryId: integer, nullable, references countries.id onDelete set null  ← 'country_id', integer FK
- cityId: integer, nullable, references cities.id onDelete set null  ← 'city_id'
- categoryId: integer, nullable, references categories.id onDelete set null  ← 'category_id'
- status: businessStatusEnum, notNull, default 'DRAFT'
- isTopPartner: boolean, notNull, default false  ← 'is_top_partner'
- isRecommended: boolean, notNull, default false  ← 'is_recommended'
- createdAt: timestamp with timezone, notNull, defaultNow()
- updatedAt: timestamp with timezone, notNull, defaultNow()
- deletedAt: timestamp with timezone, nullable

Indexes:
- businessesSlugUx: uniqueIndex on slug
- businessesUserIdIdx: index on userId
- businessesStatusIdx: index on status
- businessesCategoryIdIdx: index on categoryId
- businessesCountryIdIdx: index on countryId
- businessesTopPartnerIdx: index on isTopPartner
  (for fast query: WHERE is_top_partner = true AND status = 'PUBLISHED')

File to create:
- src/db/schema/business.ts

No relations(). Show me the diff.
```

### Группа 4: club_cards + introductions + audit_logs

```
Create the final 3 tables.

1. src/db/schema/card.ts
   Table name: 'club_cards'
   Columns:
   - id: uuid, primaryKey, defaultRandom()
   - userId: uuid, notNull, references users.id onDelete cascade  ← 'user_id'
   - number: text, unique, notNull  ← 'number', format: VIP-UA-XXXXXXXXXX
   - memberType: cardMemberTypeEnum, notNull  ← 'member_type'
   - status: cardStatusEnum, notNull, default 'ACTIVE'
   - expiresAt: timestamp with timezone, nullable  ← 'expires_at'
   - createdAt: timestamp with timezone, notNull, defaultNow()
   - updatedAt: timestamp with timezone, notNull, defaultNow()

   Indexes:
   - cardsNumberUx: uniqueIndex on number  ← PK lookup for verify-card
   - cardsUserIdIdx: index on userId
   - cardsStatusIdx: index on status

2. src/db/schema/introduction.ts
   Table name: 'introductions'
   Columns:
   - id: uuid, primaryKey, defaultRandom()
   - requesterId: uuid, notNull, references users.id onDelete restrict  ← 'requester_id'
     NOTE: onDelete restrict — don't cascade delete introductions when user deleted
   - targetBusinessId: uuid, notNull, references businesses.id onDelete restrict ← 'target_business_id'
   - clientName: text, notNull  ← 'client_name'
   - clientContact: text, notNull  ← 'client_contact' — phone or email
   - message: text, nullable
   - status: introductionStatusEnum, notNull, default 'SUBMITTED'
   - adminNote: text, nullable  ← 'admin_note'
   - createdAt: timestamp with timezone, notNull, defaultNow()
   - updatedAt: timestamp with timezone, notNull, defaultNow()

   Indexes:
   - introductionsRequesterIdIdx: index on requesterId
   - introductionsTargetBusinessIdIdx: index on targetBusinessId
   - introductionsStatusIdx: index on status
   - introductionsCreatedAtIdx: index on createdAt desc
     (for admin table: newest first)

3. src/db/schema/audit.ts
   Table name: 'audit_logs'
   Columns:
   - id: uuid, primaryKey, defaultRandom()
   - actorUserId: uuid, nullable, references users.id onDelete set null  ← 'actor_user_id'
     nullable: system events have no actor
   - action: text, notNull  ← e.g. 'USER_CREATE', 'BUSINESS_PUBLISH', 'INTRODUCTION_APPROVE'
   - entityType: text, nullable  ← 'entity_type' e.g. 'business', 'user', 'introduction'
   - entityId: text, nullable  ← 'entity_id'
   - payload: jsonb, nullable  ← diff, request context
   - ipAddress: text, nullable  ← 'ip_address'
   - createdAt: timestamp with timezone, notNull, defaultNow()

   Indexes:
   - auditLogsActorIdIdx: index on actorUserId
   - auditLogsActionIdx: index on action
   - auditLogsEntityIdx: index on (entityType, entityId)
   - auditLogsCreatedAtIdx: index on createdAt desc
     (for admin log: newest first)

   NOTE: audit_logs is APPEND-ONLY. No updatedAt, no deletedAt.

Files to create:
- src/db/schema/card.ts
- src/db/schema/introduction.ts
- src/db/schema/audit.ts

No relations() in any. Show me all 3 diffs.
```

**Что проверять:**

```ts
// introduction.ts ✅
requesterId: uuid("requester_id")
  .notNull()
  .references(() => users.id, { onDelete: "restrict" }),
// onDelete: "restrict" — НЕ cascade
// Нельзя удалить пользователя пока у него есть introductions
// Это соответствует требованию SPEC — история introductions сохранятся

// audit.ts ✅
// NO updatedAt column — append-only table
createdAt: timestamp("created_at", { withTimezone: true })
  .defaultNow()
  .notNull(),
// deletedAt тоже нет

// ❌ не должно быть
updatedAt: timestamp("updated_at")... // в audit_logs нет update
```

```bash
pnpm typecheck
# → 0 errors (не считая возможных "cannot find" для _relations.ts — это OK, он следующий)

git add src/db/schema/
git commit -m "feat(b03): all 9 table schemas (users, profiles, countries, cities, categories, businesses, cards, introductions, audit_logs)"
```

---

## Шаг B03.04 — `_relations.ts` + `index.ts`

Вставьте в Cursor Agent:

```
Read /prompts/META/PATCHES/Patch-05-drizzle-relations-extract.md.

Create two files that complete the schema:

1. src/db/schema/_relations.ts
   - Import ALL table files
   - Define relations() for EVERY table
   - This is the ONLY file that imports multiple sibling schema files
   - No other schema file imports siblings (only _relations.ts does)

   Relations to define:

   users:
   - profile: one(profiles, fields: [users.id], references: [profiles.userId])
   - businesses: many(businesses)
   - cards: many(club_cards)
   - introductions: many(introductions, { relationName: 'requester' })
   - auditLogs: many(audit_logs)

   profiles:
   - user: one(users, fields: [profiles.userId], references: [users.id])
   - country: one(countries, fields: [profiles.countryId], references: [countries.id])
   - city: one(cities, fields: [profiles.cityId], references: [cities.id])

   countries:
   - cities: many(cities)
   - profiles: many(profiles)
   - businesses: many(businesses)

   cities:
   - country: one(countries, fields: [cities.countryId], references: [countries.id])
   - profiles: many(profiles)
   - businesses: many(businesses)

   categories:
   - businesses: many(businesses)
   - parent: one(categories, fields: [categories.parentId], references: [categories.id], relationName: 'subcategories')
   - children: many(categories, { relationName: 'subcategories' })

   businesses:
   - user: one(users, fields: [businesses.userId], references: [users.id])
   - country: one(countries, fields: [businesses.countryId], references: [countries.id])
   - city: one(cities, fields: [businesses.cityId], references: [cities.id])
   - category: one(categories, fields: [businesses.categoryId], references: [categories.id])
   - introductions: many(introductions, { relationName: 'targetBusiness' })

   club_cards:
   - user: one(users, fields: [club_cards.userId], references: [users.id])

   introductions:
   - requester: one(users, fields: [introductions.requesterId], references: [users.id], relationName: 'requester')
   - targetBusiness: one(businesses, fields: [introductions.targetBusinessId], references: [businesses.id], relationName: 'targetBusiness')

   audit_logs:
   - actor: one(users, fields: [audit_logs.actorUserId], references: [users.id])

2. src/db/schema/index.ts
   - Re-export all table exports (NOT _relations)
   - Re-export all enum exports
   - Pattern:
     export * from './user'
     export * from './profile'
     export * from './country'
     export * from './city'
     export * from './category'
     export * from './business'
     export * from './card'
     export * from './introduction'
     export * from './audit'
     export * from './enums/user-role'
     export * from './enums/user-status'
     export * from './enums/business-status'
     export * from './enums/card-status'
     export * from './enums/introduction-status'
   - Do NOT export _relations from index.ts

3. Update src/db/client.ts
   - Import schema: import * as schema from './schema'
   - Import relations: import * as relations from './schema/_relations'
   - Pass to drizzle: schema: { ...schema, ...relations }

Files:
- src/db/schema/_relations.ts (create)
- src/db/schema/index.ts (create)
- src/db/client.ts (modify)

Show me all 3 diffs.
```

**Что проверять:**

```ts
// _relations.ts ✅
import { relations } from 'drizzle-orm';

import { countries } from './country';
import { profiles } from './profile';
import { users } from './user';

// ... все импорты из отдельных файлов

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  // ...
}));

// ❌ НЕ должно быть в user.ts, profile.ts и т.д.
// В них — только pgTable, никаких relations()
```

```ts
// index.ts ✅
export * from './user';
export * from './profile';
// ...

// ❌ не должно быть
export * from './_relations'; // relations НЕ в index
```

```ts
// client.ts ✅
import * as schema from './schema';
// таблицы + enums
import * as relations from './schema/_relations';

// relations отдельно

export const db = drizzle(sql, {
  schema: { ...schema, ...relations },
  logger: env.NODE_ENV === 'development',
});
```

Проверить отсутствие циклических импортов:

```bash
# если установлен madge
npx madge --circular src/db/schema
# должно вывести: No circular dependency found!

# если madge нет — просто проверка typescript
pnpm typecheck
# → 0 errors
```

```bash
git add src/db/schema/_relations.ts src/db/schema/index.ts src/db/client.ts
git commit -m "feat(b03): _relations.ts (centralized), schema index, updated db client"
```

---

## Шаг B03.05 — Первая миграция + применение к Supabase

Это самый ответственный шаг — первое прикосновение к реальной БД.

### Подшаг 1 — Генерация SQL

```bash
pnpm db:generate
```

Drizzle-kit должен создать файл `drizzle/0000_initial_schema.sql`.

```bash
# смотрим что сгенерировалось
cat drizzle/0000_initial_schema.sql
```

**Что должно быть в SQL — быстрая проверка:**

```bash
# проверяем наличие всех таблиц
grep "CREATE TABLE" drizzle/0000_initial_schema.sql
# должно быть:
# CREATE TABLE "users" (
# CREATE TABLE "profiles" (
# CREATE TABLE "countries" (
# CREATE TABLE "cities" (
# CREATE TABLE "categories" (
# CREATE TABLE "businesses" (
# CREATE TABLE "club_cards" (
# CREATE TABLE "introductions" (
# CREATE TABLE "audit_logs" (

# проверяем enum'ы
grep "CREATE TYPE" drizzle/0000_initial_schema.sql
# должно быть 6 CREATE TYPE (5 enum файлов, card_status.ts содержит 2)

# проверяем что profiles.country_id — integer, не varchar
grep -A5 "country_id" drizzle/0000_initial_schema.sql | grep "integer\|varchar"
# должно быть "integer" — если "varchar" → Patch-04 не применён, стоп
```

Если что-то не так — не применяем, сначала чиним схему:

```
The migration SQL shows profiles.country_id as varchar, but it must be integer.
Fix src/db/schema/profile.ts — countryId must be integer() not varchar().
Then regenerate with pnpm db:generate
```

### Подшаг 2 — Применение к Supabase

```bash
# убедиться что DATABASE_URL_DIRECT в .env.local заполнен
grep "DATABASE_URL_DIRECT" .env.local
# должно быть реальное значение, не REPLACE_ME

# применяем
pnpm db:migrate
```

**Ожидаемый вывод:**

```
drizzle-kit: v0.28.x
Database: postgresql://...supabase.co:5432/postgres

[✓] Your database is up to date!
  or
[✓] 1 migration applied
```

Если ошибка:

```bash
# Ошибка: "prepared statement already exists"
# → вы используете pooled URL вместо direct
# Проверьте drizzle.config.ts — должен быть DATABASE_URL_DIRECT (port 5432)
grep "DATABASE_URL" drizzle.config.ts

# Ошибка: "permission denied to create type"
# → та же проблема, PgBouncer не поддерживает CREATE TYPE
# Fix: убедитесь что drizzle.config.ts использует DATABASE_URL_DIRECT

# Ошибка: "SSL connection required"
# Добавьте в DATABASE_URL_DIRECT: ?sslmode=require
# postgres://user:pass@host:5432/postgres?sslmode=require
```

### Подшаг 3 — Визуальная проверка через Studio

```bash
pnpm db:studio
# открывается в браузере на localhost:4983
# должны быть видны все 9 таблиц в левом sidebar'е
```

Если Studio открылось и таблицы видны:

```bash
git add drizzle/ src/db/
git commit -m "feat(b03): initial migration — 9 tables, 6 enums applied to Supabase"
```

---

## Шаг B03.06 — Seed данные

Вставьте в Cursor Agent:

```
Create the database seed script for development.

Read /docs/STACK-DECISION.md ADR-003, AGENTS.md §5 (PII).

File: src/db/seed.ts

Requirements:
- Only runs when NODE_ENV === 'development' OR env.ALLOW_SEED === '1'
- If neither condition met: log error and exit(1)
- Uses db from @/db/client
- Uses faker for fake data — import from '@faker-js/faker'
  (we will need to: pnpm add -D @faker-js/faker)
- Faker.seed(42) — fixed seed for reproducible data
- Wraps everything in try/catch, logs success or failure
- Clears tables in reverse FK order before seeding (for idempotency)
- Uses console.log (seed script, not app code — logger not needed)

Seed data to create:

1. Countries (15 records — real data, not fake):
   Insert these exactly:
   { name: 'Ukraine', iso2: 'UA', flagEmoji: '🇺🇦' }
   { name: 'United States', iso2: 'US', flagEmoji: '🇺🇸' }
   { name: 'Germany', iso2: 'DE', flagEmoji: '🇩🇪' }
   { name: 'Poland', iso2: 'PL', flagEmoji: '🇵🇱' }
   { name: 'United Kingdom', iso2: 'GB', flagEmoji: '🇬🇧' }
   { name: 'France', iso2: 'FR', flagEmoji: '🇫🇷' }
   { name: 'Spain', iso2: 'ES', flagEmoji: '🇪🇸' }
   { name: 'Italy', iso2: 'IT', flagEmoji: '🇮🇹' }
   { name: 'Netherlands', iso2: 'NL', flagEmoji: '🇳🇱' }
   { name: 'Czech Republic', iso2: 'CZ', flagEmoji: '🇨🇿' }
   { name: 'Austria', iso2: 'AT', flagEmoji: '🇦🇹' }
   { name: 'Switzerland', iso2: 'CH', flagEmoji: '🇨🇭' }
   { name: 'Canada', iso2: 'CA', flagEmoji: '🇨🇦' }
   { name: 'Australia', iso2: 'AU', flagEmoji: '🇦🇺' }
   { name: 'Israel', iso2: 'IL', flagEmoji: '🇮🇱' }

2. Cities (5 per major country — UA, US, DE, PL, GB):
   Ukraine: Kyiv, Lviv, Odessa, Kharkiv, Dnipro
   US: New York, Los Angeles, Chicago, Miami, San Francisco
   Germany: Berlin, Munich, Hamburg, Frankfurt, Cologne
   Poland: Warsaw, Krakow, Gdansk, Wroclaw, Poznan
   UK: London, Manchester, Birmingham, Edinburgh, Liverpool

3. Categories (10 records):
   { name: 'Technology', slug: 'technology', icon: 'laptop' }
   { name: 'Finance & Banking', slug: 'finance', icon: 'landmark' }
   { name: 'Legal Services', slug: 'legal', icon: 'scale' }
   { name: 'Marketing & Advertising', slug: 'marketing', icon: 'megaphone' }
   { name: 'Real Estate', slug: 'real-estate', icon: 'building-2' }
   { name: 'Healthcare', slug: 'healthcare', icon: 'heart-pulse' }
   { name: 'Education & Training', slug: 'education', icon: 'graduation-cap' }
   { name: 'Logistics & Transport', slug: 'logistics', icon: 'truck' }
   { name: 'Food & Beverage', slug: 'food', icon: 'coffee' }
   { name: 'Consulting', slug: 'consulting', icon: 'briefcase' }

4. Users (4 test users):
   - admin@kclub.dev: role ADMIN, status ACTIVE, clerkUserId 'seed_admin_001'
   - business@kclub.dev: role BUSINESS, status ACTIVE, clerkUserId 'seed_business_001'
   - member@kclub.dev: role FREE, status ACTIVE, clerkUserId 'seed_member_001'
   - inactive@kclub.dev: role FREE, status INACTIVE, clerkUserId 'seed_inactive_001'

   Note: these Clerk IDs are fake/seed-only and won't match real Clerk accounts.
   They exist only for DB-level testing (Studio, SQL queries).
   For full auth testing, create real accounts via Clerk UI.

5. Businesses (8 records — PUBLISHED, using faker but NO real PII):
   - 3 with isTopPartner: true
   - 2 with isRecommended: true
   - status: 'PUBLISHED' for 6, 'PENDING' for 1, 'DRAFT' for 1
   - All linked to business@kclub.dev user (or faker-generated users)
   - Use faker.company.name() for names
   - Generate slug from name: toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
   - Use categories and countries from the seeded data above
   - description: faker.company.catchPhrase() + ' ' + faker.lorem.sentences(2)

6. Club Cards (1 per user, VIP for business user, FREE for member):
   - business user: number 'VIP-UA-SEED00001', memberType 'VIP', status 'ACTIVE'
   - member user: number 'VIP-UA-SEED00002', memberType 'FREE', status 'ACTIVE'
   - admin user: number 'BUS-UA-SEED00003', memberType 'BUSINESS', status 'ACTIVE'
   - expires_at: 2027-12-31 for all

Run order (to respect FK):
countries → cities → categories → users → businesses → cards

Clear order (reverse of run order):
cards → introductions → businesses → users → categories → cities → countries

Note: audit_logs and profiles: don't seed these, they're generated by the app.

File: src/db/seed.ts (create)
Show me the diff.
```

Перед запуском — устанавливаем faker:

```bash
pnpm add -D @faker-js/faker
```

**Что проверять в diff:**

```ts
// ✅ seed.ts начало
import { faker } from '@faker-js/faker';

faker.seed(42); // ← фиксированный seed

const isAllowed = process.env.NODE_ENV === 'development' || process.env.ALLOW_SEED === '1';

if (!isAllowed) {
  console.error('Seed is only allowed in development. Set ALLOW_SEED=1 to override.');
  process.exit(1);
}

// ✅ очистка в правильном порядке
async function clearTables() {
  await db.delete(clubCards);
  await db.delete(introductions);
  await db.delete(businesses);
  await db.delete(users);
  await db.delete(categories);
  await db.delete(cities);
  await db.delete(countries);
}
```

Проверить что нет реального PII в seed:

```bash
grep -iE "real_email|real_phone|real@" src/db/seed.ts
# должно вернуть ПУСТО
```

Запускаем seed:

```bash
pnpm db:seed

# ожидаем:
# Clearing tables...
# Seeding countries... (15)
# Seeding cities... (25)
# Seeding categories... (10)
# Seeding users... (4)
# Seeding businesses... (8)
# Seeding cards... (3)
# ✓ Seed completed successfully
```

Если ошибка FK violation:

```
Seed failed with foreign key violation on businesses.user_id.
The businesses are inserted before users, or using wrong user IDs.
Fix the seed order: countries → cities → categories → users → businesses → cards
And make sure businesses reference the inserted user IDs, not hardcoded strings.
Show me the seed order in the script.
```

Проверка в Studio:

```bash
pnpm db:studio
# открыть countries → должно быть 15 записей
# открыть businesses → должно быть 8 записей
# открыть categories → должно быть 10 записей
```

```bash
git add src/db/seed.ts package.json pnpm-lock.yaml
git commit -m "feat(b03): seed script — 15 countries, 25 cities, 10 categories, 4 test users, 8 businesses, 3 cards"
```

---

## Шаг B03.07 — Создать helper'ы для частых запросов

Вставьте в Cursor Agent:

```
Create query helper functions we'll use repeatedly in B04, B09, B11.
Keep them small (< 30 lines each).

1. src/features/auth/lib/get-user-by-clerk-id.ts
   - import "server-only"
   - async function getUserByClerkId(clerkUserId: string)
   - Returns User | null
   - db.query.users.findFirst({ where: eq(users.clerkUserId, clerkUserId) })

2. src/features/directory/lib/get-published-businesses.ts
   - import "server-only"
   - async function getPublishedBusinesses(opts?: {
       categoryId?: number;
       countryId?: number;
       search?: string;
       limit?: number;
       offset?: number;
     })
   - Returns businesses with category and country via 'with'
   - WHERE status = 'PUBLISHED' AND deleted_at IS NULL
   - ORDER BY is_top_partner DESC, is_recommended DESC, created_at DESC
   - Default limit: 12

3. src/features/directory/lib/get-business-by-slug.ts
   - import "server-only"
   - async function getBusinessBySlug(slug: string)
   - Returns business with user, category, country, city or null
   - WHERE slug = ? AND status = 'PUBLISHED' AND deleted_at IS NULL

4. src/db/schema/helpers.ts
   - Export a withTimestamps helper object for DRY column definitions:
     export const withTimestamps = {
       createdAt: timestamp(...).notNull().defaultNow(),
       updatedAt: timestamp(...).notNull().defaultNow(),
     }
   NOTE: we can't use this retroactively in existing schemas
   (don't modify them), but new tables can use it.

Files to create:
- src/features/auth/lib/get-user-by-clerk-id.ts
- src/features/directory/lib/get-published-businesses.ts
- src/features/directory/lib/get-business-by-slug.ts
- src/db/schema/helpers.ts

Show me all diffs.
```

**Что проверять:**

```ts
// get-published-businesses.ts ✅
import { and, desc, eq, ilike, isNull } from 'drizzle-orm';
import 'server-only';

import { db } from '@/db/client';
import { businesses } from '@/db/schema';

export async function getPublishedBusinesses(opts = {}) {
  const { categoryId, countryId, search, limit = 12, offset = 0 } = opts;

  return db.query.businesses.findMany({
    where: and(
      eq(businesses.status, 'PUBLISHED'),
      isNull(businesses.deletedAt), // ← soft delete check
      categoryId ? eq(businesses.categoryId, categoryId) : undefined,
      countryId ? eq(businesses.countryId, countryId) : undefined,
      search ? ilike(businesses.name, `%${search}%`) : undefined,
    ),
    with: {
      category: true,
      country: true,
    },
    orderBy: [
      desc(businesses.isTopPartner),
      desc(businesses.isRecommended),
      desc(businesses.createdAt),
    ],
    limit,
    offset,
  });
}
```

---

## Финальная проверка B03

```bash
pnpm lint && pnpm typecheck && pnpm build
# → всё зелёное

pnpm db:studio
# → все 9 таблиц видны, данные из seed присутствуют
```

Финальная структура файлов B03:

```bash
git log --oneline
# feat(b03): query helpers for auth, directory
# feat(b03): seed script
# feat(b03): _relations.ts, schema index, updated db client
# feat(b03): all 9 table schemas
# feat(b03): Drizzle pg enums
# feat(b03): drizzle config + db client (pooled + direct URLs, prepare:false)
# feat(b02): ...
```

```bash
git push origin feat/b03-database-schema
# открыть PR → merge в main
```

---

## Если что-то пошло не так

### `Cannot find module '@/db/schema'`

```
The path alias @/ is not resolving to src/.
Check tsconfig.json — it must have:
"paths": { "@/*": ["./src/*"] }
And next.config.ts must not override this.
Show me both files.
```

### `relation "users" does not exist` при seed

```
The migration was not applied.
Run: pnpm db:migrate
Then check: pnpm db:studio — tables should appear.
If db:migrate fails, check DATABASE_URL_DIRECT in .env.local
— it must be port 5432 (direct), not 6543 (pooled).
```

### Circular dependency в \_relations.ts

```
TypeScript reports circular dependency involving _relations.ts.
The fix: _relations.ts imports from table files.
Table files must NOT import from _relations.ts.
Check each file: user.ts, business.ts, etc. — none should import _relations.
Show me all import statements in src/db/schema/ files.
```

### Faker types error

```bash
# если @faker-js/faker types не подтянулись
pnpm add -D @faker-js/faker
pnpm typecheck
```

---

## Что готово после B03 и что дальше

После B03 у вас есть:

- ✅ **9 таблиц в Supabase** с правильными FK, индексами, soft-delete
- ✅ **6 enum типов** без TypeScript enum keyword — чистый Drizzle/Postgres
- ✅ **Centralized relations** без циклических импортов (Patch-05 применён)
- ✅ **integer FK** для profile.countryId (Patch-04 применён)
- ✅ **Seed данные**: 15 стран, 25 городов, 10 категорий, 4 пользователя, 8 бизнесов, 3 карты
- ✅ **Query helpers** для auth и directory
- ✅ **Drizzle Studio** работает для наглядного просмотра данных

**B04 — Auth + Onboarding** — следующий.

Там мы подключим Clerk webhook (`/api/clerk/webhook`) который будет создавать `users` строку при регистрации, напишем onboarding страницу (`/en/m/onboarding`) с формой профиля, и настроим middleware редиректы так чтобы новый пользователь автоматически попадал на onboarding до первого входа в dashboard.

Скажите «готов к B04» после того как `pnpm db:studio` показывает 9 таблиц с данными.
> ARCHIVED, 2026-06-06: historical sprint draft only. Do not execute literally.
> Use `docs/RELEASE-ROADMAP.md` and `docs/LEGACY-CONTEXT.md` for current work.
