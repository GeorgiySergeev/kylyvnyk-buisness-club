06-indexes-and-constraints-plan.md
Title
Indexes & Constraints — planning and validation

Objective
Document and validate key indexes/constraints for performance and data integrity aligned with MVP queries.

Steps
Define core indexes for catalog filters and moderation
Ensure unique constraints for emails, slugs, card numbers
Provide quick SQL checks to confirm presence
Plan future composite indexes based on usage
Plan (aligns with Step 2 DDL)
Users
UNIQUE email, UNIQUE clerk_user_id
Profiles
PK on user_id (1–1)
Countries/Cities
UNIQUE countries.iso2
UNIQUE (cities.country_id, cities.name)
INDEX cities.country_id
Categories
UNIQUE slug
Businesses
INDEX status
INDEX (country_id, city_id, category_id)
INDEX (is_top_partner, is_recommended)
Partner Offers
Consider INDEX (business_id, visibility, valid_to)
Memberships
UNIQUE (user_id, type, status='ACTIVE') — modeled via composite unique
Cards
UNIQUE number
UNIQUE user_id (1 card per user)
Stripe
UNIQUE stripe_subscription_id
UNIQUE (user_id, stripe_customer_id)
stripe_events UNIQUE event_id (idempotency)
Audit Logs
INDEX (entity, entity_id)
INDEX actor_user_id
Validation snippets (run in a SQL console)
sql

copy
-- Indexes on businesses
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'businesses';

-- Unique constraints (example)
SELECT conname, pg_get_constraintdef(c.oid)
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname IN ('users', 'categories', 'cards', 'subscriptions');
Future considerations
FTS index (GIN) on businesses(name, short_description) for search
Partial index for partner_offers WHERE visibility='PRIVATE_AFTER_LOGIN'
Time-based index on partner_offers(valid_to) for active offers filter
Acceptance
All listed indexes/uniques exist (as per Step 2 DDL)
EXPLAIN ANALYZE on catalog list shows index usage on filter fields
No duplicate keys possible for critical uniques (email, slug, card number)
