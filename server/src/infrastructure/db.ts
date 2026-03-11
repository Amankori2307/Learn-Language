import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { Pool } from "pg";
import { getDatabaseRuntimeEnv } from "../config/database.runtime";

const runtimeEnv = getDatabaseRuntimeEnv();

export const pool = new Pool({ connectionString: runtimeEnv.DATABASE_URL });
export const db = drizzle(pool, { schema });

export async function ensureDatabaseConnection(): Promise<void> {
  await pool.query("select 1");
}
