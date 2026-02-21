import { Client } from "pg";

const BASELINE_HASH_0000 = "fa69cbeafa0dd4b527d0f87dc5332741bade42dac9828f479be8b9e00f514ed5";
const BASELINE_CREATED_AT_0000 = 1771606648825;

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'words' AND column_name = 'telugu'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'words' AND column_name = 'original_script'
        ) THEN
          ALTER TABLE public.words RENAME COLUMN telugu TO original_script;
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'sentences' AND column_name = 'telugu'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'sentences' AND column_name = 'original_script'
        ) THEN
          ALTER TABLE public.sentences RENAME COLUMN telugu TO original_script;
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'word_examples' AND column_name = 'telugu_sentence'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'word_examples' AND column_name = 'source_sentence'
        ) THEN
          ALTER TABLE public.word_examples RENAME COLUMN telugu_sentence TO source_sentence;
        END IF;
      END $$;
    `);

    await client.query("ALTER TABLE public.words ADD COLUMN IF NOT EXISTS language text;");
    await client.query("ALTER TABLE public.sentences ADD COLUMN IF NOT EXISTS language text;");
    await client.query("ALTER TABLE public.word_examples ADD COLUMN IF NOT EXISTS language text;");

    await client.query("UPDATE public.words SET language = 'telugu' WHERE language IS NULL OR language = '';");
    await client.query("UPDATE public.sentences SET language = 'telugu' WHERE language IS NULL OR language = '';");
    await client.query("UPDATE public.word_examples SET language = 'telugu' WHERE language IS NULL OR language = '';");

    await client.query("UPDATE public.sentences SET difficulty = 1 WHERE difficulty IS NULL;");
    await client.query("UPDATE public.word_examples SET pronunciation = '' WHERE pronunciation IS NULL;");
    await client.query("UPDATE public.word_examples SET context_tag = 'general' WHERE context_tag IS NULL OR context_tag = '';");
    await client.query("UPDATE public.word_examples SET difficulty = 1 WHERE difficulty IS NULL;");
    await client.query("UPDATE public.words SET difficulty = 1 WHERE difficulty IS NULL;");
    await client.query("UPDATE public.words SET difficulty_level = 'beginner' WHERE difficulty_level IS NULL OR difficulty_level = '';");
    await client.query("UPDATE public.words SET frequency_score = 0.5 WHERE frequency_score IS NULL;");

    await client.query("ALTER TABLE public.words ALTER COLUMN language SET NOT NULL;");
    await client.query("ALTER TABLE public.sentences ALTER COLUMN language SET NOT NULL;");
    await client.query("ALTER TABLE public.word_examples ALTER COLUMN language SET NOT NULL;");

    await client.query("CREATE SCHEMA IF NOT EXISTS drizzle;");
    await client.query(`
      CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
        id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        hash text NOT NULL,
        created_at bigint
      );
    `);

    const tableCountResult = await client.query<{
      count: string;
    }>(`
      SELECT count(*)::text AS count
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'users',
          'sessions',
          'words',
          'clusters',
          'word_examples',
          'quiz_attempts',
          'user_word_progress',
          'word_clusters',
          'word_review_events',
          'sentences'
        );
    `);

    const migrationExistsResult = await client.query<{ exists: boolean }>(
      "SELECT EXISTS (SELECT 1 FROM drizzle.__drizzle_migrations WHERE hash = $1) AS exists;",
      [BASELINE_HASH_0000],
    );

    const tableCount = Number.parseInt(tableCountResult.rows[0]?.count ?? "0", 10);
    const migrationExists = migrationExistsResult.rows[0]?.exists === true;

    if (tableCount > 0 && !migrationExists) {
      await client.query(
        "INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2);",
        [BASELINE_HASH_0000, BASELINE_CREATED_AT_0000],
      );
      console.log("Registered baseline migration 0000 for legacy schema.");
    } else {
      console.log("Legacy migration baseline already aligned.");
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
