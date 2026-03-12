import { registerAs } from "@nestjs/config";
import { getRuntimeEnv } from "./env.runtime";

export const databaseConfig = registerAs("database", () => ({
  url: getRuntimeEnv().DATABASE_URL,
}));
