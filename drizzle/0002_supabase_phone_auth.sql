ALTER TABLE "users" ADD COLUMN "supabase_user_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
UPDATE "users"
SET "phone" = '+1000000' || lpad(row_number::text, 8, '0')
FROM (
  SELECT "id", row_number() OVER (ORDER BY "created_at", "id") AS row_number
  FROM "users"
) AS numbered_users
WHERE "users"."id" = numbered_users."id"
  AND "users"."phone" IS NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_clerk_user_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_clerk_user_id_ux";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_supabase_user_id_ux" ON "users" USING btree ("supabase_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_ux" ON "users" USING btree ("phone");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "clerk_user_id";
