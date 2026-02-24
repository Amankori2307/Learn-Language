import { index, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { DbTableNameEnum } from "../database.enums";

export const sessions = pgTable(
  DbTableNameEnum.SESSIONS,
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);
