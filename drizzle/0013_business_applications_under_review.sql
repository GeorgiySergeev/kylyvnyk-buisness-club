DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumtypid = 'business_status'::regtype
      AND enumlabel = 'PENDING'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumtypid = 'business_status'::regtype
      AND enumlabel = 'UNDER_REVIEW'
  ) THEN
    ALTER TYPE business_status RENAME VALUE 'PENDING' TO 'UNDER_REVIEW';
  ELSIF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumtypid = 'business_status'::regtype
      AND enumlabel = 'UNDER_REVIEW'
  ) THEN
    ALTER TYPE business_status ADD VALUE 'UNDER_REVIEW';
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE businesses ALTER COLUMN status SET DEFAULT 'UNDER_REVIEW';
--> statement-breakpoint
UPDATE businesses SET status = 'UNDER_REVIEW' WHERE status::text IN ('DRAFT', 'PENDING');
--> statement-breakpoint
UPDATE businesses SET status = 'HIDDEN' WHERE status::text = 'DECLINED';
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "business_applications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid,
  "business_name" text NOT NULL,
  "category_id" integer NOT NULL,
  "representative_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "country_id" integer NOT NULL,
  "city_name" text NOT NULL,
  "website_or_social" text NOT NULL,
  "confirm_authority" boolean DEFAULT false NOT NULL,
  "accept_legal" boolean DEFAULT false NOT NULL,
  "status" "business_status" DEFAULT 'UNDER_REVIEW' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "business_applications" ADD CONSTRAINT "business_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "business_applications" ADD CONSTRAINT "business_applications_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "business_applications" ADD CONSTRAINT "business_applications_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "business_applications_category_id_idx" ON "business_applications" USING btree ("category_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "business_applications_country_id_idx" ON "business_applications" USING btree ("country_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "business_applications_status_idx" ON "business_applications" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "business_applications_user_id_idx" ON "business_applications" USING btree ("user_id");
