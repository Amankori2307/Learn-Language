import { sql } from "drizzle-orm";
import { db, pool } from "../server/db";

async function run() {
  await db.execute(sql.raw(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role text DEFAULT 'learner' NOT NULL;
  `));

  await db.execute(sql.raw(`
    ALTER TABLE words
      ADD COLUMN IF NOT EXISTS review_status text DEFAULT 'approved' NOT NULL,
      ADD COLUMN IF NOT EXISTS submitted_by varchar,
      ADD COLUMN IF NOT EXISTS submitted_at timestamp DEFAULT now(),
      ADD COLUMN IF NOT EXISTS reviewed_by varchar,
      ADD COLUMN IF NOT EXISTS reviewed_at timestamp,
      ADD COLUMN IF NOT EXISTS review_notes text,
      ADD COLUMN IF NOT EXISTS reviewer_confidence_score integer,
      ADD COLUMN IF NOT EXISTS requires_secondary_review boolean DEFAULT false NOT NULL,
      ADD COLUMN IF NOT EXISTS disagreement_status text DEFAULT 'none' NOT NULL,
      ADD COLUMN IF NOT EXISTS source_url text,
      ADD COLUMN IF NOT EXISTS source_captured_at timestamp;
  `));

  await db.execute(sql.raw(`
    CREATE INDEX IF NOT EXISTS words_review_status_idx ON words (review_status);
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS word_review_events (
      id serial PRIMARY KEY,
      word_id integer NOT NULL REFERENCES words(id),
      from_status text NOT NULL,
      to_status text NOT NULL,
      changed_by varchar NOT NULL REFERENCES users(id),
      notes text,
      source_url text,
      source_captured_at timestamp,
      created_at timestamp DEFAULT now()
    );
  `));

  await db.execute(sql.raw(`
    CREATE INDEX IF NOT EXISTS word_review_events_word_created_idx
      ON word_review_events (word_id, created_at);
  `));

  console.log("Review governance migration completed.");
}

run()
  .catch((error) => {
    console.error("Review governance migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
