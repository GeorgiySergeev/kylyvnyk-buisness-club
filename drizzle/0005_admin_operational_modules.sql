CREATE TABLE IF NOT EXISTS "memberships" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "plan_code" text NOT NULL,
  "status" text DEFAULT 'ACTIVE' NOT NULL,
  "starts_at" timestamp with time zone DEFAULT now() NOT NULL,
  "ends_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "memberships_user_status_idx" ON "memberships" USING btree ("user_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "memberships_user_plan_active_ux" ON "memberships" USING btree ("user_id","plan_code","status");

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stripe_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "code" text NOT NULL,
  "payment_link_url" text NOT NULL,
  "status" text DEFAULT 'ACTIVE' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "stripe_links_code_ux" ON "stripe_links" USING btree ("code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stripe_links_status_idx" ON "stripe_links" USING btree ("status");

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stripe_subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "stripe_subscription_id" text NOT NULL,
  "user_id" uuid,
  "status" text NOT NULL,
  "current_period_end" timestamp with time zone,
  "cancel_at_period_end" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stripe_subscriptions" ADD CONSTRAINT "stripe_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "stripe_subscriptions_stripe_id_ux" ON "stripe_subscriptions" USING btree ("stripe_subscription_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stripe_subscriptions_status_idx" ON "stripe_subscriptions" USING btree ("status");

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catalog_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "summary" text,
  "status" text DEFAULT 'DRAFT' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "catalog_items_business_status_idx" ON "catalog_items" USING btree ("business_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "catalog_items_business_slug_ux" ON "catalog_items" USING btree ("business_id","slug");
