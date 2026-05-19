# Каркас миграций Drizzle (DDL) по моделям — готовый scaffold

# step-2-drizzle-ddl/README.md

## Title

Step 2 — Drizzle DDL Overview

## Objective

Сконцентрированная документация по доменной схеме (Postgres + Drizzle ORM) для KCLUB-MVP. Фокус: строгие enum-типажи, уникальности, индексы под основные запросы, соответствие юридическим и комплаенс-требованиям.

## Contents

- 00-overview-entities-and-relations.md — Общая карта сущностей и enum’ов
- 01-core-user-profile-membership-card.md — Пользователи, профили, членство, карты
- 02-geo-country-city.md — Геосправочники
- 03-catalog-business-category.md — Категории и бизнесы
- 04-partner-offers-special-conditions.md — Приватные условия партнёров
- 05-business-introductions-admin-only.md — Business Introductions (VIP-only, админ-процесс)
- 06-stripe-subscriptions-and-status.md — Подписки Stripe и события
- 07-auditlog-and-events.md — Аудит-лог
- 08-indexes-uniques-constraints.md — Индексы, уникальности, ограничения
- 09-seed-scripts-outline.md — План сидов и порядок

## Commands

- Генерация миграций: pnpm db:generate
- Применение миграций: pnpm db:migrate
- Локальная студия (опционально): pnpm db:studio

## Guardrails

- PII: публичные роуты не раскрывают email/телефоны/платежи/историю.
- High-risk: запрещённые категории не должны появляться в сид-деплоях.
- BI: без терминов MLM/affiliate/commission/earnings/passive income.
- Refund: подписки невозвратны (кроме случаев по закону) — отражено в Legal, не в DDL.

---

## Дерево файлов (предлагаемое)

- drizzle.config.ts
- src/db/
  - config.ts
  - schema/
    - enums.ts
    - user.ts
    - geo.ts
    - catalog.ts
    - membership.ts
    - stripe.ts
    - audit.ts
    - index.ts

drizzle.config.ts

```ts
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle', // migrations folder
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

src/db/config.ts

```ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl для Neon/Supabase в проде:
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool);
```

src/db/schema/enums.ts

```ts
import { pgEnum } from 'drizzle-orm/pg-core';

export const userStatusEnum = pgEnum('user_status', ['ACTIVE', 'BLOCKED']);

export const membershipTypeEnum = pgEnum('membership_type', ['FREE', 'VIP']);
export const membershipStatusEnum = pgEnum('membership_status', ['ACTIVE', 'CANCELED']);

export const businessStatusEnum = pgEnum('business_status', ['UNDER_REVIEW', 'PUBLISHED', 'HIDDEN']);

export const cardStatusEnum = pgEnum('card_status', ['ACTIVE', 'INACTIVE', 'EXPIRED']);

export const offerVisibilityEnum = pgEnum('offer_visibility', ['PRIVATE_AFTER_LOGIN', 'PUBLIC']);

export const introductionStatusEnum = pgEnum('introduction_status', [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'CLOSED',
]);
```

src/db/schema/user.ts

```ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userStatusEnum } from './enums';
import { profiles } from './user';
import { memberships } from './membership';
import { businesses } from './catalog';
import { auditLogs } from './audit';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  // В проекте планируется Clerk — храним внешний ключ провайдера:
  clerkUserId: varchar('clerk_user_id', { length: 191 }).notNull().unique(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  status: userStatusEnum('status').notNull().default('ACTIVE'),
  isAdmin: boolean('is_admin').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const profiles = pgTable('profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phone: varchar('phone', { length: 50 }),
  countryId: varchar('country_id', { length: 36 }), // FK на countries.id (serial) — свяжем через geo.ts
  cityId: varchar('city_id', { length: 36 }), // см. geo.ts (serial) — укажем отношения там
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  memberships: many(memberships),
  businesses: many(businesses),
  auditLogs: many(auditLogs, { relationName: 'actor' }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));
```

src/db/schema/geo.ts

```ts
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { profiles } from './user';
import { businesses } from './catalog';

export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  iso2: varchar('iso2', { length: 2 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  countryId: serial('country_id').notNull().references(() => countries.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 160 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  countryNameIdx: index('idx_cities_country').on(t.countryId),
  uniqueCountryCity: uniqueIndex('ux_cities_country_name').on(t.countryId, t.name),
}));

export const countriesRelations = relations(countries, ({ many }) => ({
  cities: many(cities),
  businesses: many(businesses),
}));

export const citiesRelations = relations(cities, ({ many }) => ({
  businesses: many(businesses),
}));

export const profilesGeoRelations = relations(profiles, ({ one }) => ({
  // Мягкие связи через значения id (опциональны для профиля)
  // При необходимости, можно сделать FK как integer через миграцию профиля,
  // но в MVP оставим хранение id как строку (для простоты миграций)
  // или скорректируем профиль на integer FK в дальнейшем.
}));
```

src/db/schema/catalog.ts

```ts
import {
  pgTable,
  uuid,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user';
import { countries, cities } from './geo';
import { businessStatusEnum, offerVisibilityEnum } from './enums';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerUserId: uuid('owner_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  representativeName: varchar('representative_name', { length: 160 }).notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  countryId: integer('country_id').notNull().references(() => countries.id),
  cityId: integer('city_id').notNull().references(() => cities.id),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  websiteUrl: varchar('website_url', { length: 512 }),
  shortDescription: varchar('short_description', { length: 280 }),
  status: businessStatusEnum('status').notNull().default('UNDER_REVIEW'),
  isTopPartner: boolean('is_top_partner').notNull().default(false), // для хедера на главной (3 карточки)
  isRecommended: boolean('is_recommended').notNull().default(false), // для блока "Рекомендуемые"
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
}, (t) => ({
  idxStatus: index('idx_businesses_status').on(t.status),
  idxFilters: index('idx_businesses_filters').on(t.countryId, t.cityId, t.categoryId),
  idxTop: index('idx_businesses_top').on(t.isTopPartner, t.isRecommended),
}));

export const partnerOffers = pgTable('partner_offers', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  shortText: varchar('short_text', { length: 280 }).notNull(), // special condition текст (не показывать гостям)
  details: text('details'),
  visibility: offerVisibilityEnum('visibility').notNull().default('PRIVATE_AFTER_LOGIN'),
  validFrom: timestamp('valid_from', { withTimezone: true }),
  validTo: timestamp('valid_to', { withTimezone: true }),
  priority: integer('priority').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, {
    fields: [businesses.ownerUserId],
    references: [users.id],
  }),
  country: one(countries, {
    fields: [businesses.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [businesses.cityId],
    references: [cities.id],
  }),
  category: one(categories, {
    fields: [businesses.categoryId],
    references: [categories.id],
  }),
  offers: many(partnerOffers),
}));

export const partnerOffersRelations = relations(partnerOffers, ({ one }) => ({
  business: one(businesses, {
    fields: [partnerOffers.businessId],
    references: [businesses.id],
  }),
}));
```

src/db/schema/membership.ts

```ts
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user';
import { cardStatusEnum, membershipStatusEnum, membershipTypeEnum, introductionStatusEnum } from './enums';
import { businesses } from './catalog';

export const cards = pgTable('cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }), // 1 карта на пользователя
  number: varchar('number', { length: 64 }).notNull().unique(), // напр. VIP-UA-000501
  memberName: varchar('member_name', { length: 200 }).notNull(), // дублируем ФИО для печати на карте
  memberType: membershipTypeEnum('member_type').notNull().default('FREE'),
  status: cardStatusEnum('status').notNull().default('ACTIVE'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  idxStatus: index('idx_cards_status').on(t.status),
}));

export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: membershipTypeEnum('type').notNull().default('FREE'),
  status: membershipStatusEnum('status').notNull().default('ACTIVE'),
  validTo: timestamp('valid_to', { withTimezone: true }),
  cardId: uuid('card_id').references(() => cards.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uxUserActive: uniqueIndex('ux_membership_user_type_active').on(t.userId, t.type, t.status), // гарантирует уникальность активной комбинации
  idxUser: index('idx_membership_user').on(t.userId),
}));

export const introductions = pgTable('introductions', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdByUserId: uuid('created_by_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetBusinessId: uuid('target_business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  status: introductionStatusEnum('status').notNull().default('DRAFT'),
  internalNotes: varchar('internal_notes', { length: 1000 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  idxCreator: index('idx_introductions_creator').on(t.createdByUserId),
  idxBusiness: index('idx_introductions_business').on(t.targetBusinessId),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  user: one(users, {
    fields: [cards.userId],
    references: [users.id],
  }),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  card: one(cards, {
    fields: [memberships.cardId],
    references: [cards.id],
  }),
}));

export const introductionsRelations = relations(introductions, ({ one }) => ({
  creator: one(users, { fields: [introductions.createdByUserId], references: [users.id] }),
  business: one(businesses, { fields: [introductions.targetBusinessId], references: [businesses.id] }),
}));
```

src/db/schema/stripe.ts

```ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  index,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { users } from './user';

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 120 }).notNull(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 120 }).notNull().unique(),
  statusRaw: varchar('status_raw', { length: 60 }).notNull(), // храним raw статус Stripe
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  canceledAt: timestamp('canceled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uxUserCustomer: uniqueIndex('ux_subscriptions_user_customer').on(t.userId, t.stripeCustomerId),
  idxUser: index('idx_subscriptions_user').on(t.userId),
}));

export const stripeEvents = pgTable('stripe_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: varchar('event_id', { length: 120 }).notNull().unique(), // идемпотентность
  type: varchar('type', { length: 120 }).notNull(),
  object: varchar('object', { length: 60 }).notNull(),
  payload: jsonb('payload').notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  succeeded: boolean('succeeded').notNull().default(false),
  error: text('error'),
});
```

src/db/schema/audit.ts

```ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }), // может быть null (система)
  action: varchar('action', { length: 120 }).notNull(), // e.g. USER_CREATE, BUSINESS_PUBLISH
  entity: varchar('entity', { length: 120 }).notNull(), // e.g. user, business, membership
  entityId: varchar('entity_id', { length: 191 }).notNull(),
  ip: varchar('ip', { length: 64 }),
  userAgent: text('user_agent'),
  meta: jsonb('meta'), // дополнительные поля (без PII)
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  idxEntity: index('idx_audit_entity').on(t.entity, t.entityId),
  idxActor: index('idx_audit_actor').on(t.actorUserId),
}));

export const auditRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id],
    relationName: 'actor',
  }),
}));
```

src/db/schema/index.ts

```ts
export * from './enums';
export * from './user';
export * from './geo';
export * from './catalog';
export * from './membership';
export * from './stripe';
export * from './audit';
```

Команды для генерации и применения миграций

- Генерация миграций из схемы:
  - npx drizzle-kit generate
- Применение миграций (пример скрипта в package.json):
  - "db:migrate": "drizzle-kit migrate"
- Проверка SQL (сгенерированные файлы появятся в ./drizzle)

Примечания по соответствию ТЗ

- Не собираем запрещённые в MVP данные (паспорт, ID, адрес, налоговые, банковские, документы, фото).
- Бизнес-статусы: UNDER_REVIEW, PUBLISHED, HIDDEN.
- Пользовательские статусы: ACTIVE, BLOCKED.
- Членство: type FREE/VIP и status ACTIVE/CANCELED с valid_to.
- Digital Card: отдельная таблица cards с уникальным number, member_type и expires_at; публичная верификация будет по number.
- Partner Offers: visibility по умолчанию PRIVATE_AFTER_LOGIN — без публичных скидок.
- Introductions: только админ-управление; статусы каркасные.
- Stripe: subscriptions с raw статусом и таблица stripe_events для идемпотентной обработки вебхуков.
- Индексы под фильтры каталога и модерацию, базовые уникальные ключи.

Готов к Шагу 3: настройка Clerk/Stripe, формы RHF+Zod, CRUD для бизнесов, verify-card, админ-таблицы (в отдельном диалоге).
