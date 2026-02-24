import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { DbTableNameEnum } from "../database.enums";

export const clusters = pgTable(DbTableNameEnum.CLUSTERS, {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
});

export type Cluster = typeof clusters.$inferSelect;
