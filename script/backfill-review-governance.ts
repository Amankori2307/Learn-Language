import { sql } from "drizzle-orm";
import { db, pool } from "../server/db";

async function run() {
  await db.execute(sql.raw(`
    UPDATE users
    SET role = 'learner'
    WHERE role IS NULL OR btrim(role) = '';
  `));

  await db.execute(sql.raw(`
    UPDATE words
    SET review_status = 'approved'
    WHERE review_status IS NULL
       OR btrim(review_status) = ''
       OR review_status NOT IN ('draft', 'pending_review', 'approved', 'rejected');
  `));

  await db.execute(sql.raw(`
    UPDATE words
    SET submitted_at = COALESCE(submitted_at, created_at, now())
    WHERE submitted_at IS NULL;
  `));

  await db.execute(sql.raw(`
    UPDATE words
    SET source_captured_at = submitted_at
    WHERE source_url IS NOT NULL
      AND source_captured_at IS NULL;
  `));

  console.log("Review governance backfill completed.");
}

run()
  .catch((error) => {
    console.error("Review governance backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
