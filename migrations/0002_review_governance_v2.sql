ALTER TABLE "words" ADD COLUMN "reviewer_confidence_score" integer;--> statement-breakpoint
ALTER TABLE "words" ADD COLUMN "requires_secondary_review" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "words" ADD COLUMN "disagreement_status" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
