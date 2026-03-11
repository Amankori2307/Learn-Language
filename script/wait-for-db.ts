import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { Client } from "pg";

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_RETRY_DELAY_MS = 1_000;

async function canConnect(connectionString: string) {
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 5_000,
  });

  try {
    await client.connect();
    await client.query("select 1");
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const timeoutMs = Number(process.env.DB_WAIT_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const retryDelayMs = Number(process.env.DB_WAIT_RETRY_DELAY_MS ?? DEFAULT_RETRY_DELAY_MS);
  const deadline = Date.now() + timeoutMs;

  process.stdout.write("Waiting for Postgres...\n");

  while (Date.now() < deadline) {
    if (await canConnect(connectionString)) {
      process.stdout.write("Postgres is ready.\n");
      return;
    }

    await delay(retryDelayMs);
  }

  console.error(`Timed out waiting for Postgres after ${timeoutMs}ms`);
  process.exit(1);
}

await main();
