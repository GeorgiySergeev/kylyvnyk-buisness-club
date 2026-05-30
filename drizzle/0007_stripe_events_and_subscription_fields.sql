CREATE TABLE IF NOT EXISTS "stripe_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_id" text NOT NULL,
  "type" text NOT NULL,
  "succeeded" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "processed_at" timestamp with time zone
);

CREATE UNIQUE INDEX IF NOT EXISTS "stripe_events_event_id_ux" ON "stripe_events" ("event_id");
CREATE INDEX IF NOT EXISTS "stripe_events_type_idx" ON "stripe_events" ("type");

ALTER TABLE "stripe_subscriptions" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;
ALTER TABLE "stripe_subscriptions" ADD COLUMN IF NOT EXISTS "stripe_price_id" text;
ALTER TABLE "stripe_subscriptions" ADD COLUMN IF NOT EXISTS "plan_code" text;
