import { db } from "./db";
import { eq, ne, sql, and, inArray } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import {
  LanguageEnum,
  PartOfSpeechEnum,
  QuizDirectionEnum,
  QuizModeEnum,
  QuizQuestionTypeEnum,
  ReviewDisagreementStatusEnum,
  ReviewStatusEnum,
  VocabularyTagEnum,
} from "@shared/domain/enums";
import { API_PAGINATION_DEFAULTS } from "@shared/domain/api-limits";
import {
  getClusterDescription,
  isGenericClusterDescription,
} from "@shared/domain/cluster-metadata";
import { isPartOfSpeech } from "@shared/domain/part-of-speech";
import { appLogger } from "../common/logger/logger";
import {
  words,
  clusters,
  wordClusters,
  userWordProgress,
  quizAttempts,
  wordExamples,
  users,
  wordReviewEvents,
  srsConfigs,
  type Word,
  type Cluster,
  type UserWordProgress,
  type QuizAttempt,
  type SrsConfig,
  type CreateWordRequest,
  type CreateClusterRequest,
} from "./schema";
import { STORAGE_RULES } from "./storage.constants";
import { rankQuizCandidates } from "./services/quiz-candidate-scoring";
import { generateSessionWords } from "./services/session-generator";
import { computeStreak, computeXp } from "./services/stats";
import { computeLeaderboard } from "./services/leaderboard";
import { type SrsConfigSnapshot, resolveSrsConfig } from "./services/srs-config";
import { summarizeSrsDrift, type SrsDriftSummary } from "./services/srs-drift";
import {
  LEARNING_INSIGHTS,
  LEARNING_MASTERY_LEVEL,
  LEARNING_STRENGTH,
  LEARNING_WEAK_RULES,
} from "./services/learning.constants";
import { XP_RULES } from "./services/stats.constants";

function assertLanguage(value: string): LanguageEnum {
  if (Object.values(LanguageEnum).includes(value as LanguageEnum)) {
    return value as LanguageEnum;
  }
  throw new Error(`Invalid language value: ${value}`);
}

function assertPartOfSpeech(value: string): PartOfSpeechEnum {
  if (isPartOfSpeech(value)) {
    return value;
  }
  throw new Error(`Invalid partOfSpeech value: ${value}`);
}

export type SeedWordExport = {
  key: string;
  originalScript: string;
  transliteration: string;
  english: string;
  partOfSpeech: PartOfSpeechEnum;
  language: LanguageEnum;
  difficulty: number;
  difficultyLevel: string;
  frequencyScore: number;
  cefrLevel?: string | null;
  tags?: VocabularyTagEnum[];
  clusters?: string[];
  source?: {
    type?: string;
    generatedAt?: string;
    reviewStatus?: ReviewStatusEnum;
    sourceUrl?: string;
  };
};

export type SeedSentenceExport = {
  language: LanguageEnum;
  originalScript: string;
  pronunciation: string;
  english: string;
  contextTag: string;
  difficulty: number;
  wordRefs: string[];
};

function buildSeedWordKey(language: LanguageEnum, transliteration: string, english: string): string {
  return `${language}::${transliteration.trim().toLowerCase()}::${english.trim().toLowerCase()}`;
}

function resolveSeedSourceType(input: {
  tags: VocabularyTagEnum[];
  sourceUrl: string | null;
}): string {
  if (input.tags.includes(VocabularyTagEnum.MODEL_SEED)) {
    return "model-knowledge";
  }
  if (input.sourceUrl) {
    return "reviewed-source";
  }
  return "manual-review";
}

type ClusterCatalogSort = "name_asc" | "name_desc" | "type_asc" | "words_desc" | "words_asc";

type AttemptHistoryDirection = "all" | "source_to_target" | "target_to_source";
type AttemptHistoryResult = "all" | "correct" | "wrong";
type AttemptHistorySort = "newest" | "oldest" | "confidence_desc" | "response_time_desc";

export interface IStorage {
  // Words & Clusters
  getWords(limit?: number, language?: LanguageEnum): Promise<Word[]>;
  getWord(id: number): Promise<Word | undefined>;
  updateWordAudioUrl(wordId: number, audioUrl: string): Promise<void>;
  getWordsByCluster(clusterId: number, language?: LanguageEnum): Promise<Word[]>;
  createWord(word: CreateWordRequest): Promise<Word>;

  getClusters(input?: {
    language?: LanguageEnum;
    q?: string;
    type?: string;
    sort?: ClusterCatalogSort;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Array<Cluster & { wordCount: number }>;
    page: number;
    limit: number;
    total: number;
    availableTypes: string[];
    summary: {
      totalWords: number;
      nonEmptyClusters: number;
      topCluster: (Cluster & { wordCount: number }) | null;
    };
  }>;
  getCluster(
    id: number,
    language?: LanguageEnum,
  ): Promise<(Cluster & { words: Word[] }) | undefined>;
  createCluster(cluster: CreateClusterRequest): Promise<Cluster>;
  addWordToCluster(wordId: number, clusterId: number): Promise<void>;
  getWordClusterLinks(wordIds?: number[]): Promise<Array<{ wordId: number; clusterId: number }>>;
  getWordExamples(
    wordId: number,
    language?: LanguageEnum,
  ): Promise<
    Array<{
      language: LanguageEnum;
      originalScript: string;
      pronunciation: string;
      englishSentence: string;
      contextTag: string;
      difficulty: number;
    }>
  >;

  // User Progress
  getUserProgress(userId: string, language?: LanguageEnum): Promise<UserWordProgress[]>;
  getUserWordProgress(userId: string, wordId: number): Promise<UserWordProgress | undefined>;
  updateUserProgress(progress: UserWordProgress): Promise<UserWordProgress>;
  createUserProgress(progress: Omit<UserWordProgress, "id">): Promise<UserWordProgress>;

  // Quiz
  logQuizAttempt(attempt: Omit<QuizAttempt, "id" | "createdAt">): Promise<QuizAttempt>;
  getUserAttemptHistory(
    userId: string,
    input?: {
      page?: number;
      limit?: number;
      language?: LanguageEnum;
      search?: string;
      result?: AttemptHistoryResult;
      direction?: AttemptHistoryDirection;
      sort?: AttemptHistorySort;
    },
  ): Promise<{
    items: Array<{
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
    }>;
    page: number;
    limit: number;
    total: number;
    summary: {
      total: number;
      correct: number;
      accuracy: number;
    };
  }>;
  getQuizCandidates(
    userId: string,
    limit?: number,
    clusterId?: number,
    mode?: QuizModeEnum,
    language?: LanguageEnum,
  ): Promise<Word[]>;

  // Stats
  getUserStats(
    userId: string,
    language?: LanguageEnum,
  ): Promise<{
    totalWords: number;
    mastered: number;
    learning: number;
    weak: number;
    streak: number;
    xp: number;
    recognitionAccuracy: number;
    recallAccuracy: number;
    sourceToTargetStrength: number;
    targetToSourceStrength: number;
    recommendedDirection: QuizDirectionEnum;
  }>;
  getLearningInsights(
    userId: string,
    language?: LanguageEnum,
  ): Promise<{
    clusters: Array<{
      clusterId: number;
      name: string;
      wordCount: number;
      attempts: number;
      accuracy: number;
    }>;
    categories: Array<{
      category: string;
      attempts: number;
      accuracy: number;
    }>;
    weakWords: Array<{
      wordId: number;
      originalScript: string;
      transliteration: string;
      english: string;
      wrongCount: number;
      masteryLevel: number;
    }>;
    strongWords: Array<{
      wordId: number;
      originalScript: string;
      transliteration: string;
      english: string;
      masteryLevel: number;
      averageStrength: number;
    }>;
  }>;
  getWordBucket(
    userId: string,
    input: {
      bucket: "mastered" | "learning" | "needs_review";
      page: number;
      limit: number;
      language?: LanguageEnum;
    },
  ): Promise<{
    bucket: "mastered" | "learning" | "needs_review";
    title: string;
    meaning: string;
    howToImprove: string;
    page: number;
    limit: number;
    total: number;
    words: Array<{
      wordId: number;
      originalScript: string;
      transliteration: string;
      english: string;
      masteryLevel: number;
      wrongCount: number;
      nextReview: string | null;
      averageStrength: number;
    }>;
  }>;
  getRecentAccuracy(userId: string, limit?: number, language?: LanguageEnum): Promise<number>;
  getLeaderboard(
    input: {
      userId: string;
      window: "daily" | "weekly" | "all_time";
      page?: number;
      limit?: number;
      language?: LanguageEnum;
    },
  ): Promise<{
    items: Array<{
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
    }>;
    page: number;
    limit: number;
    total: number;
    currentUserEntry: {
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
    } | null;
  }>;
  getSrsDriftSummary(language?: LanguageEnum): Promise<SrsDriftSummary>;
  getActiveSrsConfig(): Promise<SrsConfigSnapshot>;
  getReviewQueue(input: {
    status: ReviewStatusEnum;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Word[];
    page: number;
    limit: number;
    total: number;
  }>;
  getConflictReviewQueue(limit?: number): Promise<Word[]>;
  getWordWithReviewHistory(wordId: number): Promise<
    | {
        word: Word;
        clusters: Array<{
          id: number;
          name: string;
          type: string;
        }>;
        relatedClusterWords: Array<{
          id: number;
          originalScript: string;
          transliteration: string;
          english: string;
          reviewStatus: ReviewStatusEnum;
        }>;
        events: Array<{
          id: number;
          fromStatus: string;
          toStatus: string;
          changedBy: string;
          notes: string | null;
          sourceUrl: string | null;
          sourceCapturedAt: Date | null;
          createdAt: Date | null;
        }>;
      }
    | undefined
  >;
  transitionWordReview(
    wordId: number,
    reviewerId: string,
    toStatus: ReviewStatusEnum,
    input?: {
      notes?: string;
      reviewerConfidenceScore?: number;
      requiresSecondaryReview?: boolean;
      disagreementStatus?: ReviewDisagreementStatusEnum;
    },
  ): Promise<Word | undefined>;
  resolveWordReviewConflict(
    wordId: number,
    reviewerId: string,
    input: {
      toStatus: ReviewStatusEnum;
      notes?: string;
      reviewerConfidenceScore?: number;
    },
  ): Promise<Word | undefined>;
  createWordDraft(input: {
    submittedBy: string;
    language: LanguageEnum;
    originalScript: string;
    pronunciation: string;
    english: string;
    partOfSpeech: PartOfSpeechEnum;
    audioUrl?: string;
    imageUrl?: string;
    sourceUrl?: string;
    tags?: VocabularyTagEnum[];
    clusterIds?: number[];
    examples: Array<{
      originalScript: string;
      pronunciation: string;
      englishSentence: string;
      contextTag: string;
      difficulty: number;
    }>;
  }): Promise<{ word: Word; examplesCreated: number }>;

  // Admin/Seed
  exportVocabularyData(): Promise<{
    generatedAt: string;
    words: SeedWordExport[];
    sentences: SeedSentenceExport[];
  }>;
  seedInitialData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getWords(limit: number = 100, language?: LanguageEnum): Promise<Word[]> {
    const whereClause = language
      ? and(eq(words.reviewStatus, ReviewStatusEnum.APPROVED), eq(words.language, language))
      : eq(words.reviewStatus, ReviewStatusEnum.APPROVED);
    return await db.select().from(words).where(whereClause).limit(limit);
  }

  async getWord(id: number): Promise<Word | undefined> {
    const [word] = await db
      .select()
      .from(words)
      .where(and(eq(words.id, id), eq(words.reviewStatus, ReviewStatusEnum.APPROVED)));
    return word;
  }

  async updateWordAudioUrl(wordId: number, audioUrl: string): Promise<void> {
    await db.update(words).set({ audioUrl }).where(eq(words.id, wordId));
  }

  async getWordsByCluster(clusterId: number, language?: LanguageEnum): Promise<Word[]> {
    const whereClause = language
      ? and(
          eq(wordClusters.clusterId, clusterId),
          eq(words.reviewStatus, ReviewStatusEnum.APPROVED),
          eq(words.language, language),
        )
      : and(
          eq(wordClusters.clusterId, clusterId),
          eq(words.reviewStatus, ReviewStatusEnum.APPROVED),
        );
    const results = await db
      .select({
        word: words,
      })
      .from(wordClusters)
      .innerJoin(words, eq(wordClusters.wordId, words.id))
      .where(whereClause);

    return results.map((r) => r.word);
  }

  async createWord(word: CreateWordRequest): Promise<Word> {
    const normalizedReviewStatus =
      word.reviewStatus === ReviewStatusEnum.DRAFT ||
      word.reviewStatus === ReviewStatusEnum.PENDING_REVIEW ||
      word.reviewStatus === ReviewStatusEnum.APPROVED ||
      word.reviewStatus === ReviewStatusEnum.REJECTED
        ? word.reviewStatus
        : ReviewStatusEnum.APPROVED;
    const normalizedDisagreementStatus =
      word.disagreementStatus === ReviewDisagreementStatusEnum.NONE ||
      word.disagreementStatus === ReviewDisagreementStatusEnum.FLAGGED ||
      word.disagreementStatus === ReviewDisagreementStatusEnum.RESOLVED
        ? word.disagreementStatus
        : ReviewDisagreementStatusEnum.NONE;
    const [newWord] = await db
      .insert(words)
      .values({
        ...word,
        language: assertLanguage(String(word.language)),
        partOfSpeech: assertPartOfSpeech(String(word.partOfSpeech)),
        originalScript: word.originalScript,
        reviewStatus: normalizedReviewStatus,
        reviewerConfidenceScore: word.reviewerConfidenceScore ?? null,
        requiresSecondaryReview: word.requiresSecondaryReview ?? false,
        disagreementStatus: normalizedDisagreementStatus,
      })
      .returning();
    return newWord;
  }

  async getClusters(input?: {
    language?: LanguageEnum;
    q?: string;
    type?: string;
    sort?: ClusterCatalogSort;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Array<Cluster & { wordCount: number }>;
    page: number;
    limit: number;
    total: number;
    availableTypes: string[];
    summary: {
      totalWords: number;
      nonEmptyClusters: number;
      topCluster: (Cluster & { wordCount: number }) | null;
    };
  }> {
    const language = input?.language;
    const countWhere = language
      ? and(eq(words.language, language), eq(words.reviewStatus, ReviewStatusEnum.APPROVED))
      : eq(words.reviewStatus, ReviewStatusEnum.APPROVED);

    const [allClusters, counts] = await Promise.all([
      db.select().from(clusters),
      db
        .select({
          clusterId: wordClusters.clusterId,
          count: sql<number>`count(*)`,
        })
        .from(wordClusters)
        .innerJoin(words, eq(wordClusters.wordId, words.id))
        .where(countWhere)
        .groupBy(wordClusters.clusterId),
    ]);

    const countByClusterId = new Map(counts.map((row) => [row.clusterId, Number(row.count)]));
    const enriched = allClusters.map((cluster) => ({
      ...cluster,
      description: isGenericClusterDescription(cluster.description)
        ? getClusterDescription(cluster.name)
        : cluster.description,
      wordCount: countByClusterId.get(cluster.id) ?? 0,
    }));

    const baseCatalog = language ? enriched.filter((cluster) => cluster.wordCount > 0) : enriched;
    const normalizedQuery = input?.q?.trim().toLowerCase() ?? "";
    const filtered = baseCatalog.filter((cluster) => {
      if (input?.type && input.type !== "all" && cluster.type !== input.type) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }

      return [cluster.name, cluster.description ?? "", cluster.type]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });

    const sort = input?.sort ?? "words_desc";
    filtered.sort((left, right) => {
      if (sort === "name_asc") return left.name.localeCompare(right.name);
      if (sort === "name_desc") return right.name.localeCompare(left.name);
      if (sort === "type_asc") return left.type.localeCompare(right.type);
      if (sort === "words_asc") return left.wordCount - right.wordCount;
      return right.wordCount - left.wordCount;
    });

    const page = Math.max(1, input?.page ?? API_PAGINATION_DEFAULTS.PAGE);
    const limit = Math.max(1, input?.limit ?? API_PAGINATION_DEFAULTS.CLUSTER_LIMIT);
    const offset = (page - 1) * limit;

    return {
      items: filtered.slice(offset, offset + limit),
      page,
      limit,
      total: filtered.length,
      availableTypes: ["all", ...Array.from(new Set(baseCatalog.map((cluster) => cluster.type))).sort()],
      summary: {
        totalWords: baseCatalog.reduce((sum, cluster) => sum + cluster.wordCount, 0),
        nonEmptyClusters: baseCatalog.filter((cluster) => cluster.wordCount > 0).length,
        topCluster:
          baseCatalog.length > 0
            ? [...baseCatalog].sort((left, right) => right.wordCount - left.wordCount)[0] ?? null
            : null,
      },
    };
  }

  async getCluster(
    id: number,
    language?: LanguageEnum,
  ): Promise<(Cluster & { words: Word[] }) | undefined> {
    const [cluster] = await db.select().from(clusters).where(eq(clusters.id, id));
    if (!cluster) return undefined;

    const clusterWords = await this.getWordsByCluster(id, language);
    return {
      ...cluster,
      description: isGenericClusterDescription(cluster.description)
        ? getClusterDescription(cluster.name)
        : cluster.description,
      words: clusterWords,
    };
  }

  async createCluster(cluster: CreateClusterRequest): Promise<Cluster> {
    const [newCluster] = await db
      .insert(clusters)
      .values({
        ...cluster,
        description:
          cluster.description && cluster.description.trim().length > 0
            ? cluster.description
            : getClusterDescription(cluster.name),
      })
      .returning();
    return newCluster;
  }

  async addWordToCluster(wordId: number, clusterId: number): Promise<void> {
    await db.insert(wordClusters).values({ wordId, clusterId }).onConflictDoNothing();
  }

  async getWordClusterLinks(wordIds?: number[]): Promise<Array<{ wordId: number; clusterId: number }>> {
    if (wordIds && wordIds.length === 0) {
      return [];
    }

    const baseQuery = db
      .select({ wordId: wordClusters.wordId, clusterId: wordClusters.clusterId })
      .from(wordClusters);

    if (!wordIds) {
      return baseQuery;
    }

    return baseQuery.where(inArray(wordClusters.wordId, wordIds));
  }

  async getWordExamples(
    wordId: number,
    language?: LanguageEnum,
  ): Promise<
    Array<{
      language: LanguageEnum;
      originalScript: string;
      pronunciation: string;
      englishSentence: string;
      contextTag: string;
      difficulty: number;
    }>
  > {
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
    const [progress] = await db
      .select()
      .from(userWordProgress)
      .where(and(eq(userWordProgress.userId, userId), eq(userWordProgress.wordId, wordId)));
    return progress;
  }

  async updateUserProgress(progress: UserWordProgress): Promise<UserWordProgress> {
    const [updated] = await db
      .update(userWordProgress)
      .set(progress)
      .where(
        and(
          eq(userWordProgress.userId, progress.userId),
          eq(userWordProgress.wordId, progress.wordId),
        ),
      )
      .returning();
    return updated;
  }

  async createUserProgress(progress: Omit<UserWordProgress, "id">): Promise<UserWordProgress> {
    const [created] = await db.insert(userWordProgress).values(progress).returning();
    return created;
  }

  async logQuizAttempt(attempt: Omit<QuizAttempt, "id" | "createdAt">): Promise<QuizAttempt> {
    const [log] = await db.insert(quizAttempts).values(attempt).returning();
    return log;
  }

  async getUserAttemptHistory(
    userId: string,
    input?: {
      page?: number;
      limit?: number;
      language?: LanguageEnum;
      search?: string;
      result?: AttemptHistoryResult;
      direction?: AttemptHistoryDirection;
      sort?: AttemptHistorySort;
    },
  ): Promise<{
    items: Array<{
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
    }>;
    page: number;
    limit: number;
    total: number;
    summary: {
      total: number;
      correct: number;
      accuracy: number;
    };
  }> {
    const language = input?.language;
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
      .orderBy(sql`${quizAttempts.createdAt} desc`);

    const normalizedSearch = input?.search?.trim().toLowerCase() ?? "";
    const filtered = rows.filter((row) => {
      if (input?.result === "correct" && !row.isCorrect) return false;
      if (input?.result === "wrong" && row.isCorrect) return false;
      if (input?.direction && input.direction !== "all" && row.direction !== input.direction) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }

      return [row.transliteration, row.originalScript, row.english]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });

    const mapped = filtered.map((row) => ({
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

    const sort = input?.sort ?? "newest";
    mapped.sort((left, right) => {
      if (sort === "oldest") {
        return (left.createdAt?.getTime() ?? 0) - (right.createdAt?.getTime() ?? 0);
      }
      if (sort === "confidence_desc") {
        return (right.confidenceLevel ?? 0) - (left.confidenceLevel ?? 0);
      }
      if (sort === "response_time_desc") {
        return (right.responseTimeMs ?? 0) - (left.responseTimeMs ?? 0);
      }
      return (right.createdAt?.getTime() ?? 0) - (left.createdAt?.getTime() ?? 0);
    });

    const total = mapped.length;
    const correct = mapped.filter((attempt) => attempt.isCorrect).length;
    const page = Math.max(1, input?.page ?? API_PAGINATION_DEFAULTS.PAGE);
    const limit = Math.max(1, input?.limit ?? API_PAGINATION_DEFAULTS.ATTEMPT_HISTORY_LIMIT);
    const offset = (page - 1) * limit;

    return {
      items: mapped.slice(offset, offset + limit),
      page,
      limit,
      total,
      summary: {
        total,
        correct,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      },
    };
  }

  // Implementation of the "Word Selection Algorithm" from PRD
  async getQuizCandidates(
    userId: string,
    limit: number = 10,
    clusterId?: number,
    mode: QuizModeEnum = QuizModeEnum.DAILY_REVIEW,
    language?: LanguageEnum,
  ): Promise<Word[]> {
    let candidateWords: Word[] = clusterId
      ? await this.getWordsByCluster(clusterId, language)
      : await this.getWords(500, language);

    if (mode === QuizModeEnum.LISTEN_IDENTIFY) {
      candidateWords = candidateWords.filter((word) => Boolean(word.audioUrl));
    }

    const progressList = await this.getUserProgress(userId, language);
    const progressMap = new Map(progressList.map((p) => [p.wordId, p]));

    if (mode === QuizModeEnum.CLUSTER) {
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

  async getRecentAccuracy(
    userId: string,
    limit: number = 50,
    language?: LanguageEnum,
  ): Promise<number> {
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

  async getLeaderboard(input: {
    userId: string;
    window: "daily" | "weekly" | "all_time";
    page?: number;
    limit?: number;
    language?: LanguageEnum;
  }): Promise<{
    items: Array<{
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
    }>;
    page: number;
    limit: number;
    total: number;
    currentUserEntry: {
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
    } | null;
  }> {
    const window = input.window;
    const language = input.language;
    const now = new Date();
    const from = new Date(now);
    if (window === "daily") {
      from.setDate(from.getDate() - 1);
    } else if (window === "weekly") {
      from.setDate(from.getDate() - 7);
    }

    const attemptsQuery = db
      .select({
        userId: quizAttempts.userId,
        createdAt: quizAttempts.createdAt,
        isCorrect: quizAttempts.isCorrect,
        difficulty: words.difficulty,
      })
      .from(quizAttempts)
      .leftJoin(words, eq(quizAttempts.wordId, words.id));

    const attemptsPromise =
      window === "all_time"
        ? language
          ? attemptsQuery.where(eq(words.language, language))
          : attemptsQuery
        : language
          ? attemptsQuery.where(
              and(sql`${quizAttempts.createdAt} >= ${from}`, eq(words.language, language)),
            )
          : attemptsQuery.where(sql`${quizAttempts.createdAt} >= ${from}`);

    const [allUsers, attempts] = await Promise.all([db.select().from(users), attemptsPromise]);

    const ranked = computeLeaderboard(
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
      allUsers.length,
    );
    const page = Math.max(1, input.page ?? API_PAGINATION_DEFAULTS.PAGE);
    const limit = Math.max(1, input.limit ?? API_PAGINATION_DEFAULTS.LEADERBOARD_LIMIT);
    const offset = (page - 1) * limit;

    return {
      items: ranked.slice(offset, offset + limit),
      page,
      limit,
      total: ranked.length,
      currentUserEntry: ranked.find((entry) => entry.userId === input.userId) ?? null,
    };
  }

  async getSrsDriftSummary(language?: LanguageEnum): Promise<SrsDriftSummary> {
    const now = new Date();
    const whereLanguage = language ? eq(words.language, language) : undefined;

    const totalTrackedResult = language
      ? await db
          .select({ count: sql<number>`count(*)` })
          .from(userWordProgress)
          .innerJoin(words, eq(userWordProgress.wordId, words.id))
          .where(whereLanguage)
      : await db.select({ count: sql<number>`count(*)` }).from(userWordProgress);

    const overdueResult = language
      ? await db
          .select({ count: sql<number>`count(*)` })
          .from(userWordProgress)
          .innerJoin(words, eq(userWordProgress.wordId, words.id))
          .where(and(whereLanguage, sql`${userWordProgress.nextReview} < ${now}`))
      : await db
          .select({ count: sql<number>`count(*)` })
          .from(userWordProgress)
          .where(sql`${userWordProgress.nextReview} < ${now}`);

    const highIntervalResult = language
      ? await db
          .select({ count: sql<number>`count(*)` })
          .from(userWordProgress)
          .innerJoin(words, eq(userWordProgress.wordId, words.id))
          .where(
            and(
              whereLanguage,
              sql`${userWordProgress.interval} >= ${STORAGE_RULES.SRS_HIGH_INTERVAL_THRESHOLD_DAYS}`,
            ),
          )
      : await db
          .select({ count: sql<number>`count(*)` })
          .from(userWordProgress)
          .where(
            sql`${userWordProgress.interval} >= ${STORAGE_RULES.SRS_HIGH_INTERVAL_THRESHOLD_DAYS}`,
          );

    const lastAttemptResult = language
      ? await db
          .select({ lastAttemptAt: sql<Date | null>`max(${quizAttempts.createdAt})` })
          .from(quizAttempts)
          .innerJoin(words, eq(quizAttempts.wordId, words.id))
          .where(whereLanguage)
      : await db
          .select({ lastAttemptAt: sql<Date | null>`max(${quizAttempts.createdAt})` })
          .from(quizAttempts);

    const totalTracked = Number(totalTrackedResult[0]?.count ?? 0);
    const overdueCount = Number(overdueResult[0]?.count ?? 0);
    const highIntervalCount = Number(highIntervalResult[0]?.count ?? 0);
    const lastAttemptAt = lastAttemptResult[0]?.lastAttemptAt
      ? new Date(lastAttemptResult[0].lastAttemptAt)
      : null;
    const emptyReviewDays = lastAttemptAt
      ? Math.max(
          0,
          Math.floor(
            (now.getTime() - lastAttemptAt.getTime()) / STORAGE_RULES.MILLISECONDS_PER_DAY,
          ),
        )
      : STORAGE_RULES.EMPTY_REVIEW_DAYS_FALLBACK;

    return summarizeSrsDrift({
      overdueCount,
      totalTracked,
      highIntervalCount,
      emptyReviewDays,
      generatedAt: now,
    });
  }

  async getActiveSrsConfig(): Promise<SrsConfigSnapshot> {
    const [active] = await db
      .select()
      .from(srsConfigs)
      .where(eq(srsConfigs.isActive, true))
      .limit(1);
    return resolveSrsConfig((active as SrsConfig | undefined) ?? null);
  }

  async getReviewQueue(input: {
    status: ReviewStatusEnum;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Word[];
    page: number;
    limit: number;
    total: number;
  }> {
    const status = input.status;
    const page = Math.max(1, input.page ?? API_PAGINATION_DEFAULTS.PAGE);
    const limit = Math.max(1, input.limit ?? STORAGE_RULES.DEFAULT_REVIEW_QUEUE_LIMIT);
    const offset = (page - 1) * limit;

    const [rows, countResult] = await Promise.all([
      db
      .select()
      .from(words)
      .where(eq(words.reviewStatus, status))
      .orderBy(sql`${words.submittedAt} desc nulls last`, sql`${words.createdAt} desc`)
      .limit(limit)
      .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(words)
        .where(eq(words.reviewStatus, status)),
    ]);

    return {
      items: rows,
      page,
      limit,
      total: Number(countResult[0]?.count ?? 0),
    };
  }

  async getConflictReviewQueue(
    limit: number = STORAGE_RULES.DEFAULT_REVIEW_QUEUE_LIMIT,
  ): Promise<Word[]> {
    return db
      .select()
      .from(words)
      .where(eq(words.disagreementStatus, ReviewDisagreementStatusEnum.FLAGGED))
      .orderBy(
        sql`${words.reviewedAt} desc nulls last`,
        sql`${words.submittedAt} desc nulls last`,
        sql`${words.createdAt} desc`,
      )
      .limit(limit);
  }

  async transitionWordReview(
    wordId: number,
    reviewerId: string,
    toStatus: ReviewStatusEnum,
    input?: {
      notes?: string;
      reviewerConfidenceScore?: number;
      requiresSecondaryReview?: boolean;
      disagreementStatus?: ReviewDisagreementStatusEnum;
    },
  ): Promise<Word | undefined> {
    const [existing] = await db.select().from(words).where(eq(words.id, wordId));
    if (!existing) return undefined;

    const now = new Date();
    const [updated] = await db
      .update(words)
      .set({
        reviewStatus: toStatus,
        reviewedBy: reviewerId,
        reviewedAt: now,
        reviewNotes: input?.notes ?? null,
        reviewerConfidenceScore:
          input?.reviewerConfidenceScore ?? existing.reviewerConfidenceScore ?? null,
        requiresSecondaryReview:
          input?.requiresSecondaryReview ?? existing.requiresSecondaryReview ?? false,
        disagreementStatus:
          input?.disagreementStatus ??
          existing.disagreementStatus ??
          ReviewDisagreementStatusEnum.NONE,
      })
      .where(eq(words.id, wordId))
      .returning();

    await db.insert(wordReviewEvents).values({
      wordId,
      fromStatus: existing.reviewStatus ?? ReviewStatusEnum.APPROVED,
      toStatus,
      changedBy: reviewerId,
      notes: input?.notes ?? null,
      sourceUrl: updated.sourceUrl ?? null,
      sourceCapturedAt: updated.sourceCapturedAt ?? null,
    });

    return updated;
  }

  async resolveWordReviewConflict(
    wordId: number,
    reviewerId: string,
    input: {
      toStatus: ReviewStatusEnum;
      notes?: string;
      reviewerConfidenceScore?: number;
    },
  ): Promise<Word | undefined> {
    const [existing] = await db.select().from(words).where(eq(words.id, wordId));
    if (!existing || existing.disagreementStatus !== ReviewDisagreementStatusEnum.FLAGGED) {
      return undefined;
    }

    return this.transitionWordReview(wordId, reviewerId, input.toStatus, {
      notes: input.notes ? `[conflict-resolved] ${input.notes}` : "[conflict-resolved]",
      reviewerConfidenceScore: input.reviewerConfidenceScore,
      requiresSecondaryReview: false,
      disagreementStatus: ReviewDisagreementStatusEnum.RESOLVED,
    });
  }

  async getWordWithReviewHistory(wordId: number): Promise<
    | {
        word: Word;
        clusters: Array<{
          id: number;
          name: string;
          type: string;
        }>;
        relatedClusterWords: Array<{
          id: number;
          originalScript: string;
          transliteration: string;
          english: string;
          reviewStatus: ReviewStatusEnum;
        }>;
        events: Array<{
          id: number;
          fromStatus: string;
          toStatus: string;
          changedBy: string;
          notes: string | null;
          sourceUrl: string | null;
          sourceCapturedAt: Date | null;
          createdAt: Date | null;
        }>;
      }
    | undefined
  > {
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

    const linkedClusters = await db
      .select({
        id: clusters.id,
        name: clusters.name,
        type: clusters.type,
      })
      .from(wordClusters)
      .innerJoin(clusters, eq(wordClusters.clusterId, clusters.id))
      .where(eq(wordClusters.wordId, wordId))
      .orderBy(sql`${clusters.name} asc`);

    const clusterIds = linkedClusters.map((cluster) => cluster.id);
    let relatedClusterWords: Array<{
      id: number;
      originalScript: string;
      transliteration: string;
      english: string;
      reviewStatus: ReviewStatusEnum;
    }> = [];

    if (clusterIds.length > 0) {
      const relatedRows = await db
        .select({
          id: words.id,
          originalScript: words.originalScript,
          transliteration: words.transliteration,
          english: words.english,
          reviewStatus: words.reviewStatus,
        })
        .from(wordClusters)
        .innerJoin(words, eq(wordClusters.wordId, words.id))
        .where(and(inArray(wordClusters.clusterId, clusterIds), ne(words.id, wordId)))
        .orderBy(sql`${words.english} asc`)
        .limit(100);

      const dedup = new Map<number, (typeof relatedRows)[number]>();
      relatedRows.forEach((row) => {
        if (!dedup.has(row.id)) {
          dedup.set(row.id, row);
        }
      });

      relatedClusterWords = Array.from(dedup.values()).slice(0, 20);
    }

    return { word, clusters: linkedClusters, relatedClusterWords, events };
  }

  async createWordDraft(input: {
    submittedBy: string;
    language: LanguageEnum;
    originalScript: string;
    pronunciation: string;
    english: string;
    partOfSpeech: PartOfSpeechEnum;
    audioUrl?: string;
    imageUrl?: string;
    sourceUrl?: string;
    tags?: VocabularyTagEnum[];
    clusterIds?: number[];
    examples: Array<{
      originalScript: string;
      pronunciation: string;
      englishSentence: string;
      contextTag: string;
      difficulty: number;
    }>;
  }): Promise<{ word: Word; examplesCreated: number }> {
    const now = new Date();
    return db.transaction(async (tx) => {
      const [created] = await tx
        .insert(words)
        .values({
          language: input.language,
          originalScript: input.originalScript,
          transliteration: input.pronunciation,
          english: input.english,
          partOfSpeech: input.partOfSpeech,
          audioUrl: input.audioUrl ?? null,
          imageUrl: input.imageUrl ?? null,
          difficulty: 1,
          difficultyLevel: "beginner",
          frequencyScore: 0.5,
          exampleSentences: [],
          tags: input.tags ?? [VocabularyTagEnum.MANUAL_DRAFT],
          reviewStatus: ReviewStatusEnum.DRAFT,
          reviewerConfidenceScore: null,
          requiresSecondaryReview: false,
          disagreementStatus: ReviewDisagreementStatusEnum.NONE,
          submittedBy: input.submittedBy,
          submittedAt: now,
          sourceUrl: input.sourceUrl ?? null,
          sourceCapturedAt: input.sourceUrl ? now : null,
        })
        .returning();

      await tx.insert(wordExamples).values(
        input.examples.map((example) => ({
          wordId: created.id,
          language: input.language,
          originalScript: example.originalScript,
          pronunciation: example.pronunciation,
          englishSentence: example.englishSentence,
          contextTag: example.contextTag,
          difficulty: example.difficulty,
        })),
      );

      if (input.clusterIds && input.clusterIds.length > 0) {
        const uniqueClusterIds = Array.from(new Set(input.clusterIds));
        const existingClusters = await tx
          .select({ id: clusters.id })
          .from(clusters)
          .where(inArray(clusters.id, uniqueClusterIds));

        if (existingClusters.length > 0) {
          await tx
            .insert(wordClusters)
            .values(
              existingClusters.map((cluster) => ({ wordId: created.id, clusterId: cluster.id })),
            )
            .onConflictDoNothing();
        }
      }

      await tx.insert(wordReviewEvents).values({
        wordId: created.id,
        fromStatus: ReviewStatusEnum.DRAFT,
        toStatus: ReviewStatusEnum.DRAFT,
        changedBy: input.submittedBy,
        notes: "Initial draft submission",
        sourceUrl: created.sourceUrl ?? null,
        sourceCapturedAt: created.sourceCapturedAt ?? null,
      });

      return { word: created, examplesCreated: input.examples.length };
    });
  }

  async exportVocabularyData(): Promise<{
    generatedAt: string;
    words: SeedWordExport[];
    sentences: SeedSentenceExport[];
  }> {
    const allWords = await db.select().from(words);
    const allClusters = await db.select().from(clusters);
    const allWordClusterLinks = await db.select().from(wordClusters);
    const allExamples = await db.select().from(wordExamples);

    const clusterNameById = new Map(allClusters.map((cluster) => [cluster.id, cluster.name]));
    const clusterNamesByWordId = new Map<number, string[]>();

    for (const link of allWordClusterLinks) {
      const clusterName = clusterNameById.get(link.clusterId);
      if (!clusterName) {
        continue;
      }
      const names = clusterNamesByWordId.get(link.wordId) ?? [];
      names.push(clusterName);
      clusterNamesByWordId.set(link.wordId, names);
    }

    const wordKeyById = new Map<number, string>();
    const exportedWords = allWords
      .map((word) => {
        const key = buildSeedWordKey(word.language, word.transliteration, word.english);
        wordKeyById.set(word.id, key);
        const tags = word.tags ?? [];
        const clusterNames = Array.from(new Set(clusterNamesByWordId.get(word.id) ?? [])).sort();
        const generatedAt = word.sourceCapturedAt?.toISOString() ?? word.createdAt?.toISOString();

        return {
          key,
          language: word.language,
          originalScript: word.originalScript,
          transliteration: word.transliteration,
          english: word.english,
          partOfSpeech: assertPartOfSpeech(word.partOfSpeech),
          difficulty: word.difficulty,
          difficultyLevel: word.difficultyLevel,
          frequencyScore: word.frequencyScore,
          cefrLevel: word.cefrLevel ?? undefined,
          tags,
          clusters: clusterNames,
          source: {
            type: resolveSeedSourceType({
              tags,
              sourceUrl: word.sourceUrl ?? null,
            }),
            generatedAt,
            reviewStatus: word.reviewStatus,
            sourceUrl: word.sourceUrl ?? undefined,
          },
        } satisfies SeedWordExport;
      })
      .sort((left, right) => left.key.localeCompare(right.key));

    const sentenceMap = new Map<string, SeedSentenceExport>();

    for (const example of allExamples) {
      const wordRef = wordKeyById.get(example.wordId);
      if (!wordRef) {
        continue;
      }

      const sentenceKey = [
        example.language,
        example.originalScript,
        example.pronunciation,
        example.englishSentence,
        example.contextTag,
        example.difficulty,
      ].join("::");

      const existing = sentenceMap.get(sentenceKey);
      if (existing) {
        if (!existing.wordRefs.includes(wordRef)) {
          existing.wordRefs.push(wordRef);
          existing.wordRefs.sort();
        }
        continue;
      }

      sentenceMap.set(sentenceKey, {
        language: example.language,
        originalScript: example.originalScript,
        pronunciation: example.pronunciation,
        english: example.englishSentence,
        contextTag: example.contextTag,
        difficulty: example.difficulty,
        wordRefs: [wordRef],
      });
    }

    const exportedSentences = Array.from(sentenceMap.values()).sort((left, right) =>
      `${left.language}::${left.originalScript}`.localeCompare(
        `${right.language}::${right.originalScript}`,
      ),
    );

    return {
      generatedAt: new Date().toISOString(),
      words: exportedWords,
      sentences: exportedSentences,
    };
  }

  async getLearningInsights(
    userId: string,
    language?: LanguageEnum,
  ): Promise<{
    clusters: Array<{
      clusterId: number;
      name: string;
      wordCount: number;
      attempts: number;
      accuracy: number;
    }>;
    categories: Array<{
      category: string;
      attempts: number;
      accuracy: number;
    }>;
    weakWords: Array<{
      wordId: number;
      originalScript: string;
      transliteration: string;
      english: string;
      wrongCount: number;
      masteryLevel: number;
    }>;
    strongWords: Array<{
      wordId: number;
      originalScript: string;
      transliteration: string;
      english: string;
      masteryLevel: number;
      averageStrength: number;
    }>;
  }> {
    const categoryStatsRowsPromise = language
      ? db
          .select({
            category: words.partOfSpeech,
            attempts: sql<number>`count(*)`,
            correct: sql<number>`sum(case when ${quizAttempts.isCorrect} then 1 else 0 end)`,
          })
          .from(quizAttempts)
          .innerJoin(words, eq(quizAttempts.wordId, words.id))
          .where(and(eq(quizAttempts.userId, userId), eq(words.language, language)))
          .groupBy(words.partOfSpeech)
      : db
          .select({
            category: words.partOfSpeech,
            attempts: sql<number>`count(*)`,
            correct: sql<number>`sum(case when ${quizAttempts.isCorrect} then 1 else 0 end)`,
          })
          .from(quizAttempts)
          .innerJoin(words, eq(quizAttempts.wordId, words.id))
          .where(eq(quizAttempts.userId, userId))
          .groupBy(words.partOfSpeech);

    const clusterCountRowsPromise = language
      ? db
          .select({
            clusterId: clusters.id,
            name: clusters.name,
            wordCount: sql<number>`count(distinct ${wordClusters.wordId})`,
          })
          .from(wordClusters)
          .innerJoin(clusters, eq(wordClusters.clusterId, clusters.id))
          .innerJoin(words, eq(wordClusters.wordId, words.id))
          .where(
            and(eq(words.language, language), eq(words.reviewStatus, ReviewStatusEnum.APPROVED)),
          )
          .groupBy(clusters.id, clusters.name)
      : db
          .select({
            clusterId: clusters.id,
            name: clusters.name,
            wordCount: sql<number>`count(distinct ${wordClusters.wordId})`,
          })
          .from(wordClusters)
          .innerJoin(clusters, eq(wordClusters.clusterId, clusters.id))
          .innerJoin(words, eq(wordClusters.wordId, words.id))
          .where(eq(words.reviewStatus, ReviewStatusEnum.APPROVED))
          .groupBy(clusters.id, clusters.name);

    const clusterAttemptRowsPromise = language
      ? db
          .select({
            clusterId: clusters.id,
            attempts: sql<number>`count(*)`,
            correct: sql<number>`sum(case when ${quizAttempts.isCorrect} then 1 else 0 end)`,
          })
          .from(quizAttempts)
          .innerJoin(words, eq(quizAttempts.wordId, words.id))
          .innerJoin(wordClusters, eq(wordClusters.wordId, words.id))
          .innerJoin(clusters, eq(wordClusters.clusterId, clusters.id))
          .where(
            and(
              eq(quizAttempts.userId, userId),
              eq(words.language, language),
              eq(words.reviewStatus, ReviewStatusEnum.APPROVED),
            ),
          )
          .groupBy(clusters.id)
      : db
          .select({
            clusterId: clusters.id,
            attempts: sql<number>`count(*)`,
            correct: sql<number>`sum(case when ${quizAttempts.isCorrect} then 1 else 0 end)`,
          })
          .from(quizAttempts)
          .innerJoin(words, eq(quizAttempts.wordId, words.id))
          .innerJoin(wordClusters, eq(wordClusters.wordId, words.id))
          .innerJoin(clusters, eq(wordClusters.clusterId, clusters.id))
          .where(and(eq(quizAttempts.userId, userId), eq(words.reviewStatus, ReviewStatusEnum.APPROVED)))
          .groupBy(clusters.id);

    const progressRowsPromise = language
      ? db
          .select({
            wordId: userWordProgress.wordId,
            wrongCount: userWordProgress.wrongCount,
            masteryLevel: userWordProgress.masteryLevel,
            sourceToTargetStrength: userWordProgress.sourceToTargetStrength,
            targetToSourceStrength: userWordProgress.targetToSourceStrength,
            originalScript: words.originalScript,
            transliteration: words.transliteration,
            english: words.english,
          })
          .from(userWordProgress)
          .innerJoin(words, eq(userWordProgress.wordId, words.id))
          .where(and(eq(userWordProgress.userId, userId), eq(words.language, language)))
      : db
          .select({
            wordId: userWordProgress.wordId,
            wrongCount: userWordProgress.wrongCount,
            masteryLevel: userWordProgress.masteryLevel,
            sourceToTargetStrength: userWordProgress.sourceToTargetStrength,
            targetToSourceStrength: userWordProgress.targetToSourceStrength,
            originalScript: words.originalScript,
            transliteration: words.transliteration,
            english: words.english,
          })
          .from(userWordProgress)
          .innerJoin(words, eq(userWordProgress.wordId, words.id))
          .where(eq(userWordProgress.userId, userId));

    const [categoryStatsRows, clusterCountRows, clusterAttemptRows, progressRows] = await Promise.all([
      categoryStatsRowsPromise,
      clusterCountRowsPromise,
      clusterAttemptRowsPromise,
      progressRowsPromise,
    ]);

    const clusterAttemptsById = new Map(
      clusterAttemptRows.map((row) => [
        row.clusterId,
        {
          attempts: Number(row.attempts),
          correct: Number(row.correct),
        },
      ]),
    );

    const clustersInsight = clusterCountRows
      .map((row) => {
        const attemptStats = clusterAttemptsById.get(row.clusterId) ?? { attempts: 0, correct: 0 };
        return {
          clusterId: row.clusterId,
          name: row.name,
          wordCount: Number(row.wordCount),
          attempts: attemptStats.attempts,
          accuracy:
            attemptStats.attempts > 0
              ? Number(
                  (
                    (attemptStats.correct / attemptStats.attempts) *
                    STORAGE_RULES.PERCENT_MULTIPLIER
                  ).toFixed(STORAGE_RULES.ONE_DECIMAL_PLACE),
                )
              : 0,
        };
      })
      .sort((left, right) => right.attempts - left.attempts);

    const categoriesInsight = categoryStatsRows
      .map((row) => ({
        category: row.category || "unknown",
        attempts: Number(row.attempts),
        accuracy:
          Number(row.attempts) > 0
            ? Number(
                (
                  (Number(row.correct) / Number(row.attempts)) *
                  STORAGE_RULES.PERCENT_MULTIPLIER
                ).toFixed(
                  STORAGE_RULES.ONE_DECIMAL_PLACE,
                ),
              )
            : 0,
      }))
      .sort((left, right) => right.attempts - left.attempts);

    const weakWords = [...progressRows]
      .sort((left, right) => {
        const wrongDelta = (right.wrongCount ?? 0) - (left.wrongCount ?? 0);
        if (wrongDelta !== 0) return wrongDelta;
        return (left.masteryLevel ?? 0) - (right.masteryLevel ?? 0);
      })
      .slice(0, LEARNING_INSIGHTS.WEAK_WORDS_LIMIT)
      .map((row) => ({
        wordId: row.wordId,
        originalScript: row.originalScript,
        transliteration: row.transliteration,
        english: row.english,
        wrongCount: row.wrongCount ?? 0,
        masteryLevel: row.masteryLevel ?? 0,
      }));

    const strongWords = [...progressRows]
      .map((row) => ({
        ...row,
        averageStrength:
          ((row.sourceToTargetStrength ?? LEARNING_STRENGTH.DEFAULT) +
            (row.targetToSourceStrength ?? LEARNING_STRENGTH.DEFAULT)) /
          2,
      }))
      .sort((left, right) => {
        const masteryDelta = (right.masteryLevel ?? 0) - (left.masteryLevel ?? 0);
        if (masteryDelta !== 0) return masteryDelta;
        return right.averageStrength - left.averageStrength;
      })
      .slice(0, LEARNING_INSIGHTS.STRONG_WORDS_LIMIT)
      .map((row) => ({
        wordId: row.wordId,
        originalScript: row.originalScript,
        transliteration: row.transliteration,
        english: row.english,
        masteryLevel: row.masteryLevel ?? 0,
        averageStrength: Number(row.averageStrength.toFixed(LEARNING_STRENGTH.DECIMAL_PLACES)),
      }));

    return {
      clusters: clustersInsight,
      categories: categoriesInsight,
      weakWords,
      strongWords,
    };
  }

  async getWordBucket(
    userId: string,
    input: {
      bucket: "mastered" | "learning" | "needs_review";
      page: number;
      limit: number;
      language?: LanguageEnum;
    },
  ): Promise<{
    bucket: "mastered" | "learning" | "needs_review";
    title: string;
    meaning: string;
    howToImprove: string;
    page: number;
    limit: number;
    total: number;
    words: Array<{
      wordId: number;
      originalScript: string;
      transliteration: string;
      english: string;
      masteryLevel: number;
      wrongCount: number;
      nextReview: string | null;
      averageStrength: number;
    }>;
  }> {
    const progressRows = input.language
      ? await db
          .select({
            wordId: userWordProgress.wordId,
            wrongCount: userWordProgress.wrongCount,
            masteryLevel: userWordProgress.masteryLevel,
            nextReview: userWordProgress.nextReview,
            sourceToTargetStrength: userWordProgress.sourceToTargetStrength,
            targetToSourceStrength: userWordProgress.targetToSourceStrength,
            originalScript: words.originalScript,
            transliteration: words.transliteration,
            english: words.english,
          })
          .from(userWordProgress)
          .innerJoin(words, eq(userWordProgress.wordId, words.id))
          .where(and(eq(userWordProgress.userId, userId), eq(words.language, input.language)))
      : await db
          .select({
            wordId: userWordProgress.wordId,
            wrongCount: userWordProgress.wrongCount,
            masteryLevel: userWordProgress.masteryLevel,
            nextReview: userWordProgress.nextReview,
            sourceToTargetStrength: userWordProgress.sourceToTargetStrength,
            targetToSourceStrength: userWordProgress.targetToSourceStrength,
            originalScript: words.originalScript,
            transliteration: words.transliteration,
            english: words.english,
          })
          .from(userWordProgress)
          .innerJoin(words, eq(userWordProgress.wordId, words.id))
          .where(eq(userWordProgress.userId, userId));

    const now = new Date();
    const withStrength = progressRows.map((row) => ({
      ...row,
      masteryLevel: row.masteryLevel ?? 0,
      wrongCount: row.wrongCount ?? 0,
      averageStrength: Number(
        (
          ((row.sourceToTargetStrength ?? LEARNING_STRENGTH.DEFAULT) +
            (row.targetToSourceStrength ?? LEARNING_STRENGTH.DEFAULT)) /
          2
        ).toFixed(LEARNING_STRENGTH.DECIMAL_PLACES),
      ),
    }));

    const bucketConfig: Record<
      "mastered" | "learning" | "needs_review",
      { title: string; meaning: string; howToImprove: string }
    > = {
      mastered: {
        title: "Mastered Words",
        meaning: "Words with mastery level 4+ from your repeated correct recall.",
        howToImprove:
          "Keep your streak active and complete daily review so more learning words graduate to mastered.",
      },
      learning: {
        title: "Learning Words",
        meaning: "Words currently in progress (mastery level 1 to 3).",
        howToImprove:
          "Practice these daily and answer confidently in both directions to move them to mastered.",
      },
      needs_review: {
        title: "Needs Review Words",
        meaning: "Words flagged by high errors or overdue review schedule.",
        howToImprove:
          "Run weak words and daily review sessions, then lower wrong counts with repeated correct answers.",
      },
    };

    const filtered = withStrength.filter((row) => {
      if (input.bucket === "mastered")
        return row.masteryLevel >= LEARNING_MASTERY_LEVEL.MASTERED_MIN;
      if (input.bucket === "learning") {
        return (
          row.masteryLevel >= LEARNING_MASTERY_LEVEL.LEARNING_MIN &&
          row.masteryLevel < LEARNING_MASTERY_LEVEL.LEARNING_MAX_EXCLUSIVE
        );
      }
      return (
        row.wrongCount > LEARNING_WEAK_RULES.WRONG_COUNT_THRESHOLD ||
        (!!row.nextReview && new Date(row.nextReview) < now)
      );
    });

    filtered.sort((left, right) => {
      if (input.bucket === "mastered") {
        const masteryDelta = right.masteryLevel - left.masteryLevel;
        if (masteryDelta !== 0) return masteryDelta;
        return right.averageStrength - left.averageStrength;
      }

      if (input.bucket === "learning") {
        const masteryDelta = left.masteryLevel - right.masteryLevel;
        if (masteryDelta !== 0) return masteryDelta;
        return right.wrongCount - left.wrongCount;
      }

      const wrongDelta = right.wrongCount - left.wrongCount;
      if (wrongDelta !== 0) return wrongDelta;
      const leftReview = left.nextReview
        ? new Date(left.nextReview).getTime()
        : Number.MAX_SAFE_INTEGER;
      const rightReview = right.nextReview
        ? new Date(right.nextReview).getTime()
        : Number.MAX_SAFE_INTEGER;
      return leftReview - rightReview;
    });

    const total = filtered.length;
    const page = Math.max(1, input.page);
    const offset = (page - 1) * input.limit;
    const pageItems = filtered.slice(offset, offset + input.limit).map((row) => ({
      wordId: row.wordId,
      originalScript: row.originalScript,
      transliteration: row.transliteration,
      english: row.english,
      masteryLevel: row.masteryLevel,
      wrongCount: row.wrongCount,
      nextReview: row.nextReview?.toISOString() ?? null,
      averageStrength: row.averageStrength,
    }));

    return {
      bucket: input.bucket,
      ...bucketConfig[input.bucket],
      page,
      limit: input.limit,
      total,
      words: pageItems,
    };
  }

  async getUserStats(
    userId: string,
    language?: LanguageEnum,
  ): Promise<{
    totalWords: number;
    mastered: number;
    learning: number;
    weak: number;
    streak: number;
    xp: number;
    recognitionAccuracy: number;
    recallAccuracy: number;
    sourceToTargetStrength: number;
    targetToSourceStrength: number;
    recommendedDirection: QuizDirectionEnum;
  }> {
    const progressList = await this.getUserProgress(userId, language);

    // Total words in DB (approximate)
    const totalWordsResult = language
      ? await db
          .select({ count: sql<number>`count(*)` })
          .from(words)
          .where(
            and(eq(words.language, language), eq(words.reviewStatus, ReviewStatusEnum.APPROVED)),
          )
      : await db
          .select({ count: sql<number>`count(*)` })
          .from(words)
          .where(eq(words.reviewStatus, ReviewStatusEnum.APPROVED));
    const totalWords = Number(totalWordsResult[0].count);

    const mastered = progressList.filter(
      (p) => (p.masteryLevel || 0) >= LEARNING_MASTERY_LEVEL.MASTERED_MIN,
    ).length;
    const learning = progressList.filter(
      (p) =>
        (p.masteryLevel || 0) >= LEARNING_MASTERY_LEVEL.LEARNING_MIN &&
        (p.masteryLevel || 0) < LEARNING_MASTERY_LEVEL.LEARNING_MAX_EXCLUSIVE,
    ).length;

    // Weak: wrong-count threshold exceeded or overdue.
    const now = new Date();
    const weak = progressList.filter(
      (p) =>
        (p.wrongCount || 0) > LEARNING_WEAK_RULES.WRONG_COUNT_THRESHOLD ||
        (p.nextReview && new Date(p.nextReview) < now),
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
      attemptRows.map((row) => row.createdAt).filter((date): date is Date => Boolean(date)),
    );

    const correctAttempts = attemptRows.filter((row) => row.isCorrect).length;
    const hardCorrectAttempts = attemptRows.filter(
      (row) =>
        row.isCorrect &&
        (row.difficulty ?? XP_RULES.DEFAULT_WORD_DIFFICULTY) >=
          XP_RULES.HARD_WORD_DIFFICULTY_THRESHOLD,
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

    const recallAttempts = directionAttempts.filter(
      (a) => a.direction === QuizDirectionEnum.SOURCE_TO_TARGET,
    );
    const recognitionAttempts = directionAttempts.filter(
      (a) => a.direction === QuizDirectionEnum.TARGET_TO_SOURCE,
    );

    const recallCorrect = recallAttempts.filter((a) => a.isCorrect).length;
    const recognitionCorrect = recognitionAttempts.filter((a) => a.isCorrect).length;

    const recallAccuracy = recallAttempts.length > 0 ? recallCorrect / recallAttempts.length : 1;
    const recognitionAccuracy =
      recognitionAttempts.length > 0 ? recognitionCorrect / recognitionAttempts.length : 1;
    const sourceToTargetStrength =
      progressList.length > 0
        ? progressList.reduce(
            (sum, row) => sum + (row.sourceToTargetStrength ?? LEARNING_STRENGTH.DEFAULT),
            0,
          ) / progressList.length
        : LEARNING_STRENGTH.DEFAULT;
    const targetToSourceStrength =
      progressList.length > 0
        ? progressList.reduce(
            (sum, row) => sum + (row.targetToSourceStrength ?? LEARNING_STRENGTH.DEFAULT),
            0,
          ) / progressList.length
        : LEARNING_STRENGTH.DEFAULT;
    const recommendedDirection =
      recallAccuracy < recognitionAccuracy
        ? QuizDirectionEnum.SOURCE_TO_TARGET
        : QuizDirectionEnum.TARGET_TO_SOURCE;

    return {
      totalWords,
      mastered,
      learning,
      weak,
      streak,
      xp,
      recognitionAccuracy: Number(
        (recognitionAccuracy * STORAGE_RULES.PERCENT_MULTIPLIER).toFixed(
          STORAGE_RULES.ONE_DECIMAL_PLACE,
        ),
      ),
      recallAccuracy: Number(
        (recallAccuracy * STORAGE_RULES.PERCENT_MULTIPLIER).toFixed(
          STORAGE_RULES.ONE_DECIMAL_PLACE,
        ),
      ),
      sourceToTargetStrength: Number(sourceToTargetStrength.toFixed(3)),
      targetToSourceStrength: Number(targetToSourceStrength.toFixed(3)),
      recommendedDirection,
    };
  }

  async seedInitialData(): Promise<void> {
    type SeedWord = {
      key: string;
      originalScript: string;
      transliteration: string;
      english: string;
      partOfSpeech: PartOfSpeechEnum;
      language: LanguageEnum;
      difficulty: number;
      difficultyLevel: "beginner" | "easy" | "medium" | "hard";
      frequencyScore: number;
      cefrLevel?: string;
      tags?: VocabularyTagEnum[];
      clusters?: string[];
      source?: {
        type?: string;
        generatedAt?: string;
        reviewStatus?: "draft" | "pending_review" | "approved" | "rejected";
        sourceUrl?: string;
      };
    };

    type SeedSentence = {
      language: LanguageEnum;
      originalScript: string;
      pronunciation: string;
      english: string;
      contextTag: string;
      difficulty: number;
      wordRefs: string[];
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
        .where(
          and(
            eq(wordExamples.wordId, wordId),
            eq(wordExamples.language, language),
            eq(wordExamples.originalScript, originalScript),
          ),
        );

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

    const wordsPath = path.resolve(process.cwd(), "assets/processed/words.json");
    const sentencesPath = path.resolve(process.cwd(), "assets/processed/sentences.json");
    const wordsRaw = await fs.readFile(wordsPath, "utf-8");
    const sentencesRaw = await fs.readFile(sentencesPath, "utf-8");
    const wordItems = JSON.parse(wordsRaw) as SeedWord[];
    const sentenceItems = JSON.parse(sentencesRaw) as SeedSentence[];
    if (!Array.isArray(wordItems) || wordItems.length === 0) {
      throw new Error("Seed file has no rows: assets/processed/words.json");
    }
    if (!Array.isArray(sentenceItems) || sentenceItems.length === 0) {
      throw new Error("Seed file has no rows: assets/processed/sentences.json");
    }

    const clusterByName = new Map<string, Cluster>();
    const wordByRef = new Map<string, Word>();
    const sentencesByWordRef = new Map<string, SeedSentence[]>();

    for (const sentence of sentenceItems) {
      for (const wordRef of sentence.wordRefs ?? []) {
        const linked = sentencesByWordRef.get(wordRef) ?? [];
        linked.push(sentence);
        sentencesByWordRef.set(wordRef, linked);
      }
    }

    for (const item of wordItems) {
      const language = assertLanguage(item.language);
      const linkedSentences = sentencesByWordRef.get(item.key) ?? [];
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
        exampleSentences: Array.from(
          new Set(linkedSentences.map((sentence) => sentence.originalScript)),
        ),
      });
      wordByRef.set(item.key, word);

      for (const clusterName of item.clusters ?? []) {
        let cluster = clusterByName.get(clusterName);
        if (!cluster) {
          cluster = await ensureCluster({
            name: clusterName,
            type: "semantic",
            description: getClusterDescription(clusterName),
          });
          clusterByName.set(clusterName, cluster);
        }
        await this.addWordToCluster(word.id, cluster.id);
      }
    }

    for (const sentence of sentenceItems) {
      const sentenceLanguage = assertLanguage(sentence.language);
      for (const wordRef of sentence.wordRefs ?? []) {
        const linkedWord = wordByRef.get(wordRef);
        if (!linkedWord) {
          throw new Error(`Sentence references unknown word key: ${wordRef}`);
        }
        if (linkedWord.language !== sentenceLanguage) {
          throw new Error(`Sentence language mismatch for word key: ${wordRef}`);
        }
        await ensureWordExample(
          linkedWord.id,
          sentenceLanguage,
          sentence.originalScript,
          sentence.pronunciation,
          sentence.english,
          sentence.contextTag,
          sentence.difficulty,
        );
      }
    }

    const [{ count: wordsCount }] = await db.select({ count: sql<number>`count(*)` }).from(words);
    const [{ count: clustersCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clusters);
    const [{ count: linksCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(wordClusters);
    const [{ count: examplesCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(wordExamples);

    appLogger.info("Database seeded successfully", {
      wordsCount,
      clustersCount,
      linksCount,
      examplesCount,
    });
  }
}

export const storage = new DatabaseStorage();
