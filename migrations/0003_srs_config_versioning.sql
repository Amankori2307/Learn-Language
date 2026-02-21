ALTER TABLE "user_word_progress" ADD COLUMN "srs_config_version" text DEFAULT 'v1' NOT NULL;--> statement-breakpoint
CREATE TABLE "srs_configs" (
  "version" text PRIMARY KEY NOT NULL,
  "config" jsonb NOT NULL,
  "is_active" boolean DEFAULT false NOT NULL,
  "created_by" varchar,
  "created_at" timestamp DEFAULT now()
);--> statement-breakpoint
ALTER TABLE "srs_configs" ADD CONSTRAINT "srs_configs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
