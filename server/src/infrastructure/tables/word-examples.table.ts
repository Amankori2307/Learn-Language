import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { LanguageEnum } from "@shared/domain/enums";
import { DbTableNameEnum } from "../database.enums";
import { words } from "./words.table";

export const wordExamples = pgTable(DbTableNameEnum.WORD_EXAMPLES, {
  id: serial("id").primaryKey(),
  wordId: integer("word_id").references(() => words.id).notNull(),
  language: text("language").$type<LanguageEnum>().notNull(),
  originalScript: text("source_sentence").notNull(),
  pronunciation: text("pronunciation").notNull(),
  englishSentence: text("english_sentence").notNull(),
  contextTag: text("context_tag").notNull(),
  difficulty: integer("difficulty").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
