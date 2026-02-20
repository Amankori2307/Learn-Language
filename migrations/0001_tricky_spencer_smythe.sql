ALTER TABLE "sentences" ALTER COLUMN "difficulty" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sentences" ALTER COLUMN "difficulty" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "word_examples" ALTER COLUMN "pronunciation" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "word_examples" ALTER COLUMN "context_tag" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "word_examples" ALTER COLUMN "context_tag" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "word_examples" ALTER COLUMN "difficulty" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "word_examples" ALTER COLUMN "difficulty" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "words" ALTER COLUMN "difficulty" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "words" ALTER COLUMN "difficulty" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "words" ALTER COLUMN "difficulty_level" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "words" ALTER COLUMN "difficulty_level" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "words" ALTER COLUMN "frequency_score" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "words" ALTER COLUMN "frequency_score" SET NOT NULL;