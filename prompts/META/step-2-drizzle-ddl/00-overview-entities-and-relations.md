# step-2-drizzle-ddl/00-overview-entities-and-relations.md

## Title

Entities & Relations — Overview

## Objective

Карта доменных сущностей и связей для MVP.

## Entities

- users (id, clerk_user_id, email, status, is_admin, created_at, updated_at)
- profiles (user_id PK, first_name, last_name, phone, country_id?, city_id?, created_at, updated_at)
- memberships (id, user_id, type FREE|VIP, status ACTIVE|CANCELED, valid_to, card_id?)
- cards (id, user_id UNIQUE, number UNIQUE, member_name, member_type, status, expires_at, created_at,…)
- countries (id, iso2 UNIQUE, name)
- cities (id, country_id, name UNIQUE per country)
- categories (id, name, slug UNIQUE)
- businesses (id, owner_user_id → users, name, representative_name, email, phone?, country_id, city_id, category_id, website_url?, short_description?, status, is_top_partner, is_recommended, timestamps)
- partner_offers (id, business_id, short_text, details?, visibility PRIVATE_AFTER_LOGIN|PUBLIC, valid_from/to, priority, timestamps)
- introductions (id, created_by_user_id, target_business_id, status, internal_notes, timestamps)
- subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id UNIQUE, status_raw, period dates, cancel flags)
- stripe_events (id, event_id UNIQUE, type, object, payload jsonb, processed flags, timestamps)
- audit_logs (id, actor_user_id nullable, action, entity, entity_id, ip?, user_agent?, meta jsonb, created_at)

## Enums (Postgres)

- user_status: ACTIVE | BLOCKED
- membership_type: FREE | VIP
- membership_status: ACTIVE | CANCELED
- business_status: UNDER_REVIEW | PUBLISHED | HIDDEN
- card_status: ACTIVE | INACTIVE | EXPIRED
- offer_visibility: PRIVATE_AFTER_LOGIN | PUBLIC
- introduction_status: DRAFT | SUBMITTED | APPROVED | REJECTED | CLOSED

## Core relations

- users 1–1 profiles
- users 1–N memberships; users 1–1 cards (через UNIQUE user_id в cards)
- users 1–N businesses; users 1–N audit_logs
- businesses N–1 categories, countries, cities; 1–N partner_offers
- introductions: created_by_user_id → users; target_business_id → businesses
- subscriptions: user_id → users; stripe_events — автономная таблица идемпотентности
