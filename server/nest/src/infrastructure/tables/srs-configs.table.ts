import { boolean, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { DbTableNameEnum } from "../database.enums";
import { users } from "./users.table";

export const srsConfigs = pgTable(DbTableNameEnum.SRS_CONFIGS, {
  version: text("version").primaryKey(),
  config: jsonb("config")
    .$type<{
      easeMin: number;
      easeMax: number;
      incorrectEasePenalty: number;
    }>()
    .notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SrsConfig = typeof srsConfigs.$inferSelect;
