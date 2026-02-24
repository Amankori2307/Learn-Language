import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { LanguageEnum } from "@shared/domain/enums";
import { DbTableNameEnum } from "../database.enums";

export const sentences = pgTable(DbTableNameEnum.SENTENCES, {
  id: serial("id").primaryKey(),
  language: text("language").$type<LanguageEnum>().notNull(),
  originalScript: text("original_script").notNull(),
  english: text("english").notNull(),
  difficulty: integer("difficulty").notNull(),
});
