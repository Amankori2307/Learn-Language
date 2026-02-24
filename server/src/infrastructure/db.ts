import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { Pool } from "pg";
import { getRuntimeEnv } from "../config/env.runtime";

const runtimeEnv = getRuntimeEnv();

export const pool = new Pool({ connectionString: runtimeEnv.DATABASE_URL });
export const db = drizzle(pool, { schema });
