ALTER TABLE "user_word_progress" ADD COLUMN "source_to_target_strength" real DEFAULT 0.5 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_word_progress" ADD COLUMN "target_to_source_strength" real DEFAULT 0.5 NOT NULL;--> statement-breakpoint
