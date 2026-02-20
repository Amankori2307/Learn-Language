CREATE TABLE "clusters" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"word_id" integer NOT NULL,
	"question_type" text,
	"direction" text,
	"response_time_ms" integer,
	"is_correct" boolean NOT NULL,
	"confidence_level" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sentences" (
	"id" serial PRIMARY KEY NOT NULL,
	"language" text NOT NULL,
	"original_script" text NOT NULL,
	"english" text NOT NULL,
	"difficulty" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_word_progress" (
	"user_id" varchar NOT NULL,
	"word_id" integer NOT NULL,
	"correct_streak" integer DEFAULT 0,
	"wrong_count" integer DEFAULT 0,
	"ease_factor" real DEFAULT 2.5,
	"interval" integer DEFAULT 1,
	"last_seen" timestamp DEFAULT now(),
	"next_review" timestamp DEFAULT now(),
	"mastery_level" integer DEFAULT 0,
	CONSTRAINT "user_word_progress_user_id_word_id_pk" PRIMARY KEY("user_id","word_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" text DEFAULT 'learner' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "word_clusters" (
	"word_id" integer NOT NULL,
	"cluster_id" integer NOT NULL,
	CONSTRAINT "word_clusters_word_id_cluster_id_pk" PRIMARY KEY("word_id","cluster_id")
);
--> statement-breakpoint
CREATE TABLE "word_examples" (
	"id" serial PRIMARY KEY NOT NULL,
	"word_id" integer NOT NULL,
	"language" text NOT NULL,
	"source_sentence" text NOT NULL,
	"pronunciation" text,
	"english_sentence" text NOT NULL,
	"context_tag" text DEFAULT 'general',
	"difficulty" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "word_review_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"word_id" integer NOT NULL,
	"from_status" text NOT NULL,
	"to_status" text NOT NULL,
	"changed_by" varchar NOT NULL,
	"notes" text,
	"source_url" text,
	"source_captured_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "words" (
	"id" serial PRIMARY KEY NOT NULL,
	"language" text NOT NULL,
	"original_script" text NOT NULL,
	"transliteration" text NOT NULL,
	"english" text NOT NULL,
	"part_of_speech" text NOT NULL,
	"difficulty" integer DEFAULT 1,
	"difficulty_level" text DEFAULT 'beginner',
	"frequency_score" real DEFAULT 0.5,
	"cefr_level" text,
	"audio_url" text,
	"example_sentences" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"review_status" text DEFAULT 'approved' NOT NULL,
	"submitted_by" varchar,
	"submitted_at" timestamp DEFAULT now(),
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"review_notes" text,
	"source_url" text,
	"source_captured_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_word_progress" ADD CONSTRAINT "user_word_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_word_progress" ADD CONSTRAINT "user_word_progress_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_clusters" ADD CONSTRAINT "word_clusters_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_clusters" ADD CONSTRAINT "word_clusters_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_examples" ADD CONSTRAINT "word_examples_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_review_events" ADD CONSTRAINT "word_review_events_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_review_events" ADD CONSTRAINT "word_review_events_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quiz_attempts_user_created_idx" ON "quiz_attempts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "user_word_progress_user_review_idx" ON "user_word_progress" USING btree ("user_id","next_review");--> statement-breakpoint
CREATE INDEX "word_clusters_cluster_word_idx" ON "word_clusters" USING btree ("cluster_id","word_id");--> statement-breakpoint
CREATE INDEX "word_review_events_word_created_idx" ON "word_review_events" USING btree ("word_id","created_at");--> statement-breakpoint
CREATE INDEX "words_review_status_idx" ON "words" USING btree ("review_status");