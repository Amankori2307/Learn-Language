ALTER TABLE "quiz_attempts" ADD COLUMN "inferred_confidence_level" integer;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN "effective_confidence_level" integer;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN "confidence_source" text;