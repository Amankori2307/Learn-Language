import { db } from "./db";
import { eq, sql, and } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { LanguageEnum, QuizDirectionEnum, QuizModeEnum, QuizQuestionTypeEnum, ReviewStatusEnum } from "@shared/domain/enums";
import {
  words, clusters, wordClusters, userWordProgress, quizAttempts, wordExamples, users,
  wordReviewEvents,
  type Word, type Cluster, type UserWordProgress, type QuizAttempt,
  type CreateWordRequest, type CreateClusterRequest
} from "@shared/schema";
import { rankQuizCandidates } from "./services/quiz-candidate-scoring";
import { generateSessionWords, type QuizMode } from "./services/session-generator";
import { computeStreak, computeXp } from "./services/stats";
import { computeLeaderboard } from "./services/leaderboard";

function assertLanguage(value: string): LanguageEnum {
  if (Object.values(LanguageEnum).includes(value as LanguageEnum)) {
    return value as LanguageEnum;
  }
  throw new Error(`Invalid language value: ${value}`);
}

export interface IStorage {
  // Words & Clusters
  getWords(limit?: number, language?: LanguageEnum): Promise<Word[]>;
  getWord(id: number): Promise<Word | undefined>;
  getWordsByCluster(clusterId: number, language?: LanguageEnum): Promise<Word[]>;
  createWord(word: CreateWordRequest): Promise<Word>;
  
  getClusters(language?: LanguageEnum): Promise<Cluster[]>;
  getCluster(id: number, language?: LanguageEnum): Promise<(Cluster & { words: Word[] }) | undefined>;
  createCluster(cluster: CreateClusterRequest): Promise<Cluster>;
  addWordToCluster(wordId: number, clusterId: number): Promise<void>;
  getWordClusterLinks(): Promise<Array<{ wordId: number; clusterId: number }>>;
  getWordExamples(wordId: number, language?: LanguageEnum): Promise<Array<{
    language: LanguageEnum;
    originalScript: string;
    pronunciation: string;
    englishSentence: string;
    contextTag: string;
    difficulty: number;
  }>>;

  // User Progress
  getUserProgress(userId: string, language?: LanguageEnum): Promise<UserWordProgress[]>;
  getUserWordProgress(userId: string, wordId: number): Promise<UserWordProgress | undefined>;
  updateUserProgress(progress: UserWordProgress): Promise<UserWordProgress>;
  createUserProgress(progress: Omit<UserWordProgress, "id">): Promise<UserWordProgress>;
  
  // Quiz
  logQuizAttempt(attempt: Omit<QuizAttempt, "id" | "createdAt">): Promise<QuizAttempt>;
  getUserAttemptHistory(userId: string, limit?: number, language?: LanguageEnum): Promise<Array<{
    id: number;
    wordId: number;
    isCorrect: boolean;
    confidenceLevel: number | null;
    direction: QuizDirectionEnum | null;
    questionType: QuizQuestionTypeEnum | null;
    responseTimeMs: number | null;
    createdAt: Date | null;
    word: {
      language: LanguageEnum;
      originalScript: string;
      transliteration: string;
      english: string;
    };
  }>>;
  getQuizCandidates(userId: string, limit?: number, clusterId?: number, mode?: QuizMode, language?: LanguageEnum): Promise<Word[]>;
  
  // Stats
  getUserStats(userId: string, language?: LanguageEnum): Promise<{
    totalWords: number;
    mastered: number;
    learning: number;
    weak: number;
    streak: number;
    xp: number;
    recognitionAccuracy: number;
    recallAccuracy: number;
    recommendedDirection: QuizDirectionEnum;
  }>;
  getRecentAccuracy(userId: string, limit?: number, language?: LanguageEnum): Promise<number>;
  getLeaderboard(
    window: "daily" | "weekly" | "all_time",
    limit?: number,
    language?: LanguageEnum,
  ): Promise<Array<{
    rank: number;
    userId: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    profileImageUrl: string | null;
    xp: number;
    streak: number;
    attempts: number;
    accuracy: number;
  }>>;
  getReviewQueue(
    status: ReviewStatusEnum,
    limit?: number,
  ): Promise<Word[]>;
  getWordWithReviewHistory(wordId: number): Promise<{ word: Word; events: Array<{
    id: number;
    fromStatus: string;
    toStatus: string;
    changedBy: string;
    notes: string | null;
    sourceUrl: string | null;
    sourceCapturedAt: Date | null;
    createdAt: Date | null;
  }> } | undefined>;
  transitionWordReview(
    wordId: number,
    reviewerId: string,
    toStatus: ReviewStatusEnum,
    notes?: string,
  ): Promise<Word | undefined>;
  createWordDraft(input: {
    submittedBy: string;
    language: LanguageEnum;
    originalScript: string;
    transliteration: string;
    english: string;
    partOfSpeech: string;
    sourceUrl?: string;
    tags?: string[];
  }): Promise<Word>;

  // Admin/Seed
  seedInitialData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getWords(limit: number = 100, language?: LanguageEnum): Promise<Word[]> {
    const whereClause = language
      ? and(eq(words.reviewStatus, ReviewStatusEnum.APPROVED), eq(words.language, language))
      : eq(words.reviewStatus, ReviewStatusEnum.APPROVED);
    return await db
      .select()
      .from(words)
      .where(whereClause)
      .limit(limit);
  }

  async getWord(id: number): Promise<Word | undefined> {
    const [word] = await db
      .select()
      .from(words)
      .where(and(eq(words.id, id), eq(words.reviewStatus, ReviewStatusEnum.APPROVED)));
    return word;
  }

  async getWordsByCluster(clusterId: number, language?: LanguageEnum): Promise<Word[]> {
    const whereClause = language
      ? and(eq(wordClusters.clusterId, clusterId), eq(words.reviewStatus, ReviewStatusEnum.APPROVED), eq(words.language, language))
      : and(eq(wordClusters.clusterId, clusterId), eq(words.reviewStatus, ReviewStatusEnum.APPROVED));
    const results = await db.select({
      word: words
    })
    .from(wordClusters)
    .innerJoin(words, eq(wordClusters.wordId, words.id))
    .where(whereClause);
    
    return results.map(r => r.word);
  }

  async createWord(word: CreateWordRequest): Promise<Word> {
    const normalizedReviewStatus = (
      word.reviewStatus === ReviewStatusEnum.DRAFT ||
      word.reviewStatus === ReviewStatusEnum.PENDING_REVIEW ||
      word.reviewStatus === ReviewStatusEnum.APPROVED ||
      word.reviewStatus === ReviewStatusEnum.REJECTED
    )
      ? word.reviewStatus
      : ReviewStatusEnum.APPROVED;
    const [newWord] = await db
      .insert(words)
      .values({
        ...word,
        language: assertLanguage(String(word.language)),
        originalScript: word.originalScript,
        reviewStatus: normalizedReviewStatus,
      })
      .returning();
    return newWord;
  }

  async getClusters(language?: LanguageEnum): Promise<Cluster[]> {
    if (!language) {
      return await db.select().from(clusters);
    }

    const linked = await db
      .select({ clusterId: wordClusters.clusterId })
      .from(wordClusters)
      .innerJoin(words, eq(wordClusters.wordId, words.id))
      .where(and(eq(words.language, language), eq(words.reviewStatus, ReviewStatusEnum.APPROVED)));

    const clusterIds = new Set(linked.map((row) => row.clusterId));
    if (clusterIds.size === 0) {
      return [];
    }

    const allClusters = await db.select().from(clusters);
    return allClusters.filter((cluster) => clusterIds.has(cluster.id));
  }

  async getCluster(id: number, language?: LanguageEnum): Promise<(Cluster & { words: Word[] }) | undefined> {
    const [cluster] = await db.select().from(clusters).where(eq(clusters.id, id));
    if (!cluster) return undefined;

    const clusterWords = await this.getWordsByCluster(id, language);
    return { ...cluster, words: clusterWords };
  }

  async createCluster(cluster: CreateClusterRequest): Promise<Cluster> {
    const [newCluster] = await db.insert(clusters).values(cluster).returning();
    return newCluster;
  }

  async addWordToCluster(wordId: number, clusterId: number): Promise<void> {
    await db.insert(wordClusters).values({ wordId, clusterId }).onConflictDoNothing();
  }

  async getWordClusterLinks(): Promise<Array<{ wordId: number; clusterId: number }>> {
    return db.select({ wordId: wordClusters.wordId, clusterId: wordClusters.clusterId }).from(wordClusters);
  }

  async getWordExamples(wordId: number, language?: LanguageEnum): Promise<Array<{
    language: LanguageEnum;
    originalScript: string;
    pronunciation: string;
    englishSentence: string;
    contextTag: string;
    difficulty: number;
  }>> {
    const whereClause = language
      ? and(eq(wordExamples.wordId, wordId), eq(wordExamples.language, language))
      : eq(wordExamples.wordId, wordId);

    return db
      .select({
        language: wordExamples.language,
        originalScript: wordExamples.originalScript,
        pronunciation: wordExamples.pronunciation,
        englishSentence: wordExamples.englishSentence,
        contextTag: wordExamples.contextTag,
        difficulty: wordExamples.difficulty,
      })
      .from(wordExamples)
      .where(whereClause)
      .orderBy(sql`${wordExamples.id} asc`);
  }

  async getUserProgress(userId: string, language?: LanguageEnum): Promise<UserWordProgress[]> {
    if (!language) {
      return await db.select().from(userWordProgress).where(eq(userWordProgress.userId, userId));
    }

    const rows = await db
      .select({ progress: userWordProgress })
      .from(userWordProgress)
      .innerJoin(words, eq(userWordProgress.wordId, words.id))
      .where(and(eq(userWordProgress.userId, userId), eq(words.language, language)));

    return rows.map((row) => row.progress);
  }

  async getUserWordProgress(userId: string, wordId: number): Promise<UserWordProgress | undefined> {
    const [progress] = await db.select()
      .from(userWordProgress)
      .where(and(eq(userWordProgress.userId, userId), eq(userWordProgress.wordId, wordId)));
    return progress;
  }

  async updateUserProgress(progress: UserWordProgress): Promise<UserWordProgress> {
    const [updated] = await db.update(userWordProgress)
      .set(progress)
      .where(and(
        eq(userWordProgress.userId, progress.userId),
        eq(userWordProgress.wordId, progress.wordId),
      ))
      .returning();
    return updated;
  }

  async createUserProgress(progress: Omit<UserWordProgress, "id">): Promise<UserWordProgress> {
    const [created] = await db.insert(userWordProgress)
      .values(progress)
      .returning();
    return created;
  }

  async logQuizAttempt(attempt: Omit<QuizAttempt, "id" | "createdAt">): Promise<QuizAttempt> {
    const [log] = await db.insert(quizAttempts).values(attempt).returning();
    return log;
  }

  async getUserAttemptHistory(userId: string, limit: number = 100, language?: LanguageEnum): Promise<Array<{
    id: number;
    wordId: number;
    isCorrect: boolean;
    confidenceLevel: number | null;
    direction: QuizDirectionEnum | null;
    questionType: QuizQuestionTypeEnum | null;
    responseTimeMs: number | null;
    createdAt: Date | null;
    word: {
      language: LanguageEnum;
      originalScript: string;
      transliteration: string;
      english: string;
    };
  }>> {
    const whereClause = language
      ? and(eq(quizAttempts.userId, userId), eq(words.language, language))
      : eq(quizAttempts.userId, userId);

    const rows = await db
      .select({
        id: quizAttempts.id,
        wordId: quizAttempts.wordId,
        isCorrect: quizAttempts.isCorrect,
        confidenceLevel: quizAttempts.confidenceLevel,
        direction: quizAttempts.direction,
        questionType: quizAttempts.questionType,
        responseTimeMs: quizAttempts.responseTimeMs,
        createdAt: quizAttempts.createdAt,
        language: words.language,
        originalScript: words.originalScript,
        transliteration: words.transliteration,
        english: words.english,
      })
      .from(quizAttempts)
      .innerJoin(words, eq(quizAttempts.wordId, words.id))
      .where(whereClause)
      .orderBy(sql`${quizAttempts.createdAt} desc`)
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      wordId: row.wordId,
      isCorrect: row.isCorrect,
      confidenceLevel: row.confidenceLevel ?? null,
      direction:
        row.direction === QuizDirectionEnum.SOURCE_TO_TARGET ||
        row.direction === QuizDirectionEnum.TARGET_TO_SOURCE
          ? row.direction
          : null,
      questionType:
        row.questionType === QuizQuestionTypeEnum.SOURCE_TO_TARGET ||
        row.questionType === QuizQuestionTypeEnum.TARGET_TO_SOURCE
          ? row.questionType
          : null,
      responseTimeMs: row.responseTimeMs ?? null,
      createdAt: row.createdAt ?? null,
      word: {
        language: row.language as LanguageEnum,
        originalScript: row.originalScript,
        transliteration: row.transliteration,
        english: row.english,
      },
    }));
  }

  // Implementation of the "Word Selection Algorithm" from PRD
  async getQuizCandidates(
    userId: string,
    limit: number = 10,
    clusterId?: number,
    mode: QuizMode = QuizModeEnum.DAILY_REVIEW,
    language?: LanguageEnum,
  ): Promise<Word[]> {
    let candidateWords: Word[] = [];
    if (clusterId) {
      candidateWords = await this.getWordsByCluster(clusterId, language);
    } else {
      candidateWords = await this.getWords(500, language);
    }

    const progressList = await this.getUserProgress(userId, language);
    const progressMap = new Map(progressList.map(p => [p.wordId, p]));

    if (mode === "cluster") {
      const ranked = rankQuizCandidates(candidateWords, progressMap);
      return ranked.slice(0, limit);
    }

    const recentAccuracy = await this.getRecentAccuracy(userId, 50, language);
    return generateSessionWords({
      mode,
      count: limit,
      words: candidateWords,
      progressMap,
      recentAccuracy,
    });
  }

  async getRecentAccuracy(userId: string, limit: number = 50, language?: LanguageEnum): Promise<number> {
    const attempts = language
      ? await db
          .select({ isCorrect: quizAttempts.isCorrect })
          .from(quizAttempts)
          .innerJoin(words, eq(quizAttempts.wordId, words.id))
          .where(and(eq(quizAttempts.userId, userId), eq(words.language, language)))
          .orderBy(sql`${quizAttempts.createdAt} desc`)
          .limit(limit)
      : await db
          .select({ isCorrect: quizAttempts.isCorrect })
          .from(quizAttempts)
          .where(eq(quizAttempts.userId, userId))
          .orderBy(sql`${quizAttempts.createdAt} desc`)
          .limit(limit);

    if (attempts.length === 0) {
      return 1;
    }

    const correct = attempts.filter((a) => a.isCorrect).length;
    return correct / attempts.length;
  }

  async getLeaderboard(
    window: "daily" | "weekly" | "all_time",
    limit: number = 25,
    language?: LanguageEnum,
  ): Promise<Array<{
    rank: number;
    userId: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    profileImageUrl: string | null;
    xp: number;
    streak: number;
    attempts: number;
    accuracy: number;
  }>> {
    const now = new Date();
    const from = new Date(now);
    if (window === "daily") {
      from.setDate(from.getDate() - 1);
    } else if (window === "weekly") {
      from.setDate(from.getDate() - 7);
    }

    const allUsers = await db.select().from(users);
    const attemptsQuery = db
      .select({
        userId: quizAttempts.userId,
        createdAt: quizAttempts.createdAt,
        isCorrect: quizAttempts.isCorrect,
        difficulty: words.difficulty,
      })
      .from(quizAttempts)
      .leftJoin(words, eq(quizAttempts.wordId, words.id));

    const attempts = window === "all_time"
      ? await (language ? attemptsQuery.where(eq(words.language, language)) : attemptsQuery)
      : await (language
          ? attemptsQuery.where(and(sql`${quizAttempts.createdAt} >= ${from}`, eq(words.language, language)))
          : attemptsQuery.where(sql`${quizAttempts.createdAt} >= ${from}`));

    return computeLeaderboard(
      allUsers.map((u) => ({
        id: u.id,
        firstName: u.firstName ?? null,
        lastName: u.lastName ?? null,
        email: u.email ?? null,
        profileImageUrl: u.profileImageUrl ?? null,
      })),
      attempts.map((a) => ({
        userId: a.userId,
        createdAt: a.createdAt ?? null,
        isCorrect: a.isCorrect,
        difficulty: a.difficulty ?? null,
      })),
      limit,
    );
  }

  async getReviewQueue(
    status: ReviewStatusEnum,
    limit: number = 50,
  ): Promise<Word[]> {
    return db
      .select()
      .from(words)
      .where(eq(words.reviewStatus, status))
      .orderBy(sql`${words.submittedAt} desc nulls last`, sql`${words.createdAt} desc`)
      .limit(limit);
  }

  async transitionWordReview(
    wordId: number,
    reviewerId: string,
    toStatus: ReviewStatusEnum,
    notes?: string,
  ): Promise<Word | undefined> {
    const [existing] = await db.select().from(words).where(eq(words.id, wordId));
    if (!existing) return undefined;

    const now = new Date();
    const [updated] = await db.update(words)
      .set({
        reviewStatus: toStatus,
        reviewedBy: reviewerId,
        reviewedAt: now,
        reviewNotes: notes ?? null,
      })
      .where(eq(words.id, wordId))
      .returning();

    await db.insert(wordReviewEvents).values({
      wordId,
      fromStatus: existing.reviewStatus ?? ReviewStatusEnum.APPROVED,
      toStatus,
      changedBy: reviewerId,
      notes: notes ?? null,
      sourceUrl: updated.sourceUrl ?? null,
      sourceCapturedAt: updated.sourceCapturedAt ?? null,
    });

    return updated;
  }

  async getWordWithReviewHistory(wordId: number): Promise<{ word: Word; events: Array<{
    id: number;
    fromStatus: string;
    toStatus: string;
    changedBy: string;
    notes: string | null;
    sourceUrl: string | null;
    sourceCapturedAt: Date | null;
    createdAt: Date | null;
  }> } | undefined> {
    const [word] = await db.select().from(words).where(eq(words.id, wordId));
    if (!word) return undefined;

    const events = await db
      .select({
        id: wordReviewEvents.id,
        fromStatus: wordReviewEvents.fromStatus,
        toStatus: wordReviewEvents.toStatus,
        changedBy: wordReviewEvents.changedBy,
        notes: wordReviewEvents.notes,
        sourceUrl: wordReviewEvents.sourceUrl,
        sourceCapturedAt: wordReviewEvents.sourceCapturedAt,
        createdAt: wordReviewEvents.createdAt,
      })
      .from(wordReviewEvents)
      .where(eq(wordReviewEvents.wordId, wordId))
      .orderBy(sql`${wordReviewEvents.createdAt} desc`);

    return { word, events };
  }

  async createWordDraft(input: {
    submittedBy: string;
    language: LanguageEnum;
    originalScript: string;
    transliteration: string;
    english: string;
    partOfSpeech: string;
    sourceUrl?: string;
    tags?: string[];
  }): Promise<Word> {
    const now = new Date();
    const [created] = await db.insert(words).values({
      language: input.language,
      originalScript: input.originalScript,
      transliteration: input.transliteration,
      english: input.english,
      partOfSpeech: input.partOfSpeech,
      difficulty: 1,
      difficultyLevel: "beginner",
      frequencyScore: 0.5,
      exampleSentences: [],
      tags: input.tags ?? ["manual-draft"],
      reviewStatus: ReviewStatusEnum.DRAFT,
      submittedBy: input.submittedBy,
      submittedAt: now,
      sourceUrl: input.sourceUrl ?? null,
      sourceCapturedAt: input.sourceUrl ? now : null,
    }).returning();

    await db.insert(wordReviewEvents).values({
      wordId: created.id,
      fromStatus: ReviewStatusEnum.DRAFT,
      toStatus: ReviewStatusEnum.DRAFT,
      changedBy: input.submittedBy,
      notes: "Initial draft submission",
      sourceUrl: created.sourceUrl ?? null,
      sourceCapturedAt: created.sourceCapturedAt ?? null,
    });

    return created;
  }

  async getUserStats(userId: string, language?: LanguageEnum): Promise<{
    totalWords: number;
    mastered: number;
    learning: number;
    weak: number;
    streak: number;
    xp: number;
    recognitionAccuracy: number;
    recallAccuracy: number;
    recommendedDirection: QuizDirectionEnum;
  }> {
    const progressList = await this.getUserProgress(userId, language);
    
    // Total words in DB (approximate)
    const totalWordsResult = language
      ? await db.select({ count: sql<number>`count(*)` }).from(words).where(and(eq(words.language, language), eq(words.reviewStatus, ReviewStatusEnum.APPROVED)))
      : await db.select({ count: sql<number>`count(*)` }).from(words).where(eq(words.reviewStatus, ReviewStatusEnum.APPROVED));
    const totalWords = Number(totalWordsResult[0].count);

    const mastered = progressList.filter(p => (p.masteryLevel || 0) >= 4).length;
    const learning = progressList.filter(p => (p.masteryLevel || 0) > 0 && (p.masteryLevel || 0) < 4).length;
    
    // Weak: wrongCount > 2 or overdue
    const now = new Date();
    const weak = progressList.filter(p => 
      (p.wrongCount || 0) > 2 || 
      (p.nextReview && new Date(p.nextReview) < now)
    ).length;

    const attemptRows = language
      ? await db
          .select({
            createdAt: quizAttempts.createdAt,
            isCorrect: quizAttempts.isCorrect,
            difficulty: words.difficulty,
          })
          .from(quizAttempts)
          .innerJoin(words, eq(quizAttempts.wordId, words.id))
          .where(and(eq(quizAttempts.userId, userId), eq(words.language, language)))
      : await db
          .select({
            createdAt: quizAttempts.createdAt,
            isCorrect: quizAttempts.isCorrect,
            difficulty: words.difficulty,
          })
          .from(quizAttempts)
          .leftJoin(words, eq(quizAttempts.wordId, words.id))
          .where(eq(quizAttempts.userId, userId));

    const streak = computeStreak(
      attemptRows
        .map((row) => row.createdAt)
        .filter((date): date is Date => Boolean(date)),
    );

    const correctAttempts = attemptRows.filter((row) => row.isCorrect).length;
    const hardCorrectAttempts = attemptRows.filter(
      (row) => row.isCorrect && (row.difficulty ?? 1) >= 3,
    ).length;
    const xp = computeXp({ correctAttempts, hardCorrectAttempts });

    const directionAttempts = language
      ? await db
          .select({
            direction: quizAttempts.direction,
            isCorrect: quizAttempts.isCorrect,
          })
          .from(quizAttempts)
          .innerJoin(words, eq(quizAttempts.wordId, words.id))
          .where(and(eq(quizAttempts.userId, userId), eq(words.language, language)))
      : await db
          .select({
            direction: quizAttempts.direction,
            isCorrect: quizAttempts.isCorrect,
          })
          .from(quizAttempts)
          .where(eq(quizAttempts.userId, userId));

    const recallAttempts = directionAttempts.filter((a) => a.direction === QuizDirectionEnum.SOURCE_TO_TARGET);
    const recognitionAttempts = directionAttempts.filter((a) => a.direction === QuizDirectionEnum.TARGET_TO_SOURCE);

    const recallCorrect = recallAttempts.filter((a) => a.isCorrect).length;
    const recognitionCorrect = recognitionAttempts.filter((a) => a.isCorrect).length;

    const recallAccuracy = recallAttempts.length > 0 ? recallCorrect / recallAttempts.length : 1;
    const recognitionAccuracy = recognitionAttempts.length > 0 ? recognitionCorrect / recognitionAttempts.length : 1;
    const recommendedDirection = recallAccuracy < recognitionAccuracy
      ? QuizDirectionEnum.SOURCE_TO_TARGET
      : QuizDirectionEnum.TARGET_TO_SOURCE;
    
    return {
      totalWords,
      mastered,
      learning,
      weak,
      streak,
      xp,
      recognitionAccuracy: Number((recognitionAccuracy * 100).toFixed(1)),
      recallAccuracy: Number((recallAccuracy * 100).toFixed(1)),
      recommendedDirection,
    };
  }

  async seedInitialData(): Promise<void> {
    type SeedExample = {
      originalScript: string;
      pronunciation: string;
      english: string;
      contextTag: string;
      difficulty: number;
      language: LanguageEnum;
    };

    type SeedWord = {
      originalScript: string;
      transliteration: string;
      english: string;
      partOfSpeech: string;
      language: LanguageEnum;
      difficulty: number;
      difficultyLevel: "beginner" | "easy" | "medium" | "hard";
      frequencyScore: number;
      cefrLevel?: string;
      tags?: string[];
      clusters?: string[];
      examples?: SeedExample[];
    };

    const ensureCluster = async (cluster: CreateClusterRequest): Promise<Cluster> => {
      const [existingCluster] = await db
        .select()
        .from(clusters)
        .where(and(eq(clusters.name, cluster.name), eq(clusters.type, cluster.type)));

      if (existingCluster) {
        return existingCluster;
      }

      return this.createCluster(cluster);
    };

    const ensureWord = async (word: CreateWordRequest): Promise<Word> => {
      const [existingWord] = await db
        .select()
        .from(words)
        .where(
          and(
            eq(words.language, assertLanguage(String(word.language))),
            eq(words.originalScript, word.originalScript),
            eq(words.english, word.english),
          ),
        );

      if (existingWord) {
        return existingWord;
      }

      return this.createWord(word);
    };

    const ensureWordExample = async (
      wordId: number,
      language: LanguageEnum,
      originalScript: string,
      pronunciation: string,
      englishSentence: string,
      contextTag: string,
      difficulty: number,
    ) => {
      const [existingExample] = await db
        .select()
        .from(wordExamples)
        .where(and(
          eq(wordExamples.wordId, wordId),
          eq(wordExamples.language, language),
          eq(wordExamples.originalScript, originalScript),
        ));

      if (existingExample) {
        return;
      }

      await db.insert(wordExamples).values({
        wordId,
        language,
        originalScript,
        pronunciation,
        englishSentence,
        contextTag,
        difficulty,
      });
    };

    const seedPath = path.resolve(process.cwd(), "assets/processed/seed.json");
    const raw = await fs.readFile(seedPath, "utf-8");
    const items = JSON.parse(raw) as SeedWord[];
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Seed file has no rows: assets/processed/seed.json");
    }

    const clusterByName = new Map<string, Cluster>();

    for (const item of items) {
      const language = assertLanguage(item.language);
      const word = await ensureWord({
        language,
        originalScript: item.originalScript,
        transliteration: item.transliteration,
        english: item.english,
        partOfSpeech: item.partOfSpeech,
        difficulty: item.difficulty,
        difficultyLevel: item.difficultyLevel,
        frequencyScore: item.frequencyScore,
        cefrLevel: item.cefrLevel ?? null,
        tags: item.tags ?? [],
        exampleSentences: (item.examples ?? []).map((example) => example.originalScript),
      });

      for (const clusterName of item.clusters ?? []) {
        let cluster = clusterByName.get(clusterName);
        if (!cluster) {
          cluster = await ensureCluster({
            name: clusterName,
            type: "semantic",
            description: `${clusterName} imported cluster`,
          });
          clusterByName.set(clusterName, cluster);
        }
        await this.addWordToCluster(word.id, cluster.id);
      }

      for (const example of item.examples ?? []) {
        const exampleLanguage = assertLanguage(example.language);
        await ensureWordExample(
          word.id,
          exampleLanguage,
          example.originalScript,
          example.pronunciation,
          example.english,
          example.contextTag,
          example.difficulty,
        );
      }
    }

    const [{ count: wordsCount }] = await db.select({ count: sql<number>`count(*)` }).from(words);
    const [{ count: clustersCount }] = await db.select({ count: sql<number>`count(*)` }).from(clusters);
    const [{ count: linksCount }] = await db.select({ count: sql<number>`count(*)` }).from(wordClusters);
    const [{ count: examplesCount }] = await db.select({ count: sql<number>`count(*)` }).from(wordExamples);

    console.log(`Database seeded successfully! words=${wordsCount}, clusters=${clustersCount}, links=${linksCount}, examples=${examplesCount}`);
  }
}

export const storage = new DatabaseStorage();
