ALTER TYPE "public"."card_status" ADD VALUE IF NOT EXISTS 'ARCHIVED';--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "user_permission_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_by_id" uuid,
	"resource" text NOT NULL,
	"deny_view" boolean DEFAULT false NOT NULL,
	"deny_create" boolean DEFAULT false NOT NULL,
	"deny_edit" boolean DEFAULT false NOT NULL,
	"deny_delete" boolean DEFAULT false NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_permission_overrides" ADD CONSTRAINT "user_permission_overrides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permission_overrides" ADD CONSTRAINT "user_permission_overrides_assigned_by_id_users_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_permission_overrides_user_resource_ux" ON "user_permission_overrides" USING btree ("user_id","resource");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_permission_overrides_user_id_idx" ON "user_permission_overrides" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_permission_overrides_assigned_by_id_idx" ON "user_permission_overrides" USING btree ("assigned_by_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_permission_overrides_resource_idx" ON "user_permission_overrides" USING btree ("resource");
