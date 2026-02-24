import { index, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "../auth/auth.schema";
import { words } from "../vocabulary/vocabulary.schema";

export const wordReviewEvents = pgTable(
  "word_review_events",
  {
    id: serial("id").primaryKey(),
    wordId: integer("word_id").references(() => words.id).notNull(),
    fromStatus: text("from_status").notNull(),
    toStatus: text("to_status").notNull(),
    changedBy: varchar("changed_by").references(() => users.id).notNull(),
    notes: text("notes"),
    sourceUrl: text("source_url"),
    sourceCapturedAt: timestamp("source_captured_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    wordCreatedIdx: index("word_review_events_word_created_idx").on(t.wordId, t.createdAt),
  }),
);

export type WordReviewEvent = typeof wordReviewEvents.$inferSelect;
