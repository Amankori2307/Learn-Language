import test from "node:test";
import assert from "node:assert/strict";
import { eq, inArray } from "drizzle-orm";
import { storage } from "./storage";
import { db } from "./db";
import { LanguageEnum, QuizDirectionEnum, QuizModeEnum, UserTypeEnum } from "@shared/domain/enums";
import { clusters, quizAttempts, userWordProgress, users, wordClusters, words } from "@shared/schema";

function buildId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

test("language isolation: user data reads are scoped by selected language", async () => {
  const learnerUserId = buildId("p6-learner");
  const leaderboardUserId = buildId("p6-leaderboard");

  const createdWordIds: number[] = [];
  const createdClusterIds: number[] = [];
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  try {
    await db.insert(users).values([
      {
        id: learnerUserId,
        email: `${learnerUserId}@example.com`,
        firstName: "P6",
        lastName: "Learner",
        role: UserTypeEnum.LEARNER,
      },
      {
        id: leaderboardUserId,
        email: `${leaderboardUserId}@example.com`,
        firstName: "P6",
        lastName: "Leader",
        role: UserTypeEnum.LEARNER,
      },
    ]);

    const [teluguCluster, hindiCluster] = await db
      .insert(clusters)
      .values([
        { name: `p6-telugu-${Date.now()}`, type: "semantic", description: "p6 telugu cluster" },
        { name: `p6-hindi-${Date.now()}`, type: "semantic", description: "p6 hindi cluster" },
      ])
      .returning();
    createdClusterIds.push(teluguCluster.id, hindiCluster.id);

    const [teluguWord, hindiWord] = await db
      .insert(words)
      .values([
        {
          language: LanguageEnum.TELUGU,
          originalScript: `p6_telugu_${Date.now()}`,
          transliteration: "telugu-padam",
          english: "example telugu word",
          partOfSpeech: "noun",
          difficulty: 2,
          difficultyLevel: "easy",
          frequencyScore: 0.8,
        },
        {
          language: LanguageEnum.HINDI,
          originalScript: `p6_hindi_${Date.now()}`,
          transliteration: "hindi-shabd",
          english: "example hindi word",
          partOfSpeech: "noun",
          difficulty: 2,
          difficultyLevel: "easy",
          frequencyScore: 0.8,
        },
      ])
      .returning();
    createdWordIds.push(teluguWord.id, hindiWord.id);

    await db.insert(wordClusters).values([
      { wordId: teluguWord.id, clusterId: teluguCluster.id },
      { wordId: hindiWord.id, clusterId: hindiCluster.id },
    ]);

    await db.insert(userWordProgress).values([
      {
        userId: learnerUserId,
        wordId: teluguWord.id,
        correctStreak: 3,
        wrongCount: 0,
        masteryLevel: 4,
        easeFactor: 2.7,
        interval: 5,
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        userId: learnerUserId,
        wordId: hindiWord.id,
        correctStreak: 0,
        wrongCount: 3,
        masteryLevel: 1,
        easeFactor: 1.8,
        interval: 1,
        nextReview: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ]);

    await db.insert(quizAttempts).values([
      {
        userId: learnerUserId,
        wordId: teluguWord.id,
        direction: QuizDirectionEnum.SOURCE_TO_TARGET,
        isCorrect: true,
        confidenceLevel: 3,
        createdAt: tenDaysAgo,
      },
      {
        userId: learnerUserId,
        wordId: hindiWord.id,
        direction: QuizDirectionEnum.TARGET_TO_SOURCE,
        isCorrect: false,
        confidenceLevel: 1,
        createdAt: twoDaysAgo,
      },
      {
        userId: leaderboardUserId,
        wordId: hindiWord.id,
        direction: QuizDirectionEnum.TARGET_TO_SOURCE,
        isCorrect: true,
        confidenceLevel: 3,
        createdAt: now,
      },
      {
        userId: leaderboardUserId,
        wordId: hindiWord.id,
        direction: QuizDirectionEnum.TARGET_TO_SOURCE,
        isCorrect: true,
        confidenceLevel: 3,
        createdAt: now,
      },
    ]);

    const teluguHistory = await storage.getUserAttemptHistory(learnerUserId, 50, LanguageEnum.TELUGU);
    const hindiHistory = await storage.getUserAttemptHistory(learnerUserId, 50, LanguageEnum.HINDI);
    assert.equal(teluguHistory.length, 1);
    assert.equal(hindiHistory.length, 1);
    assert.equal(teluguHistory[0]?.word.language, LanguageEnum.TELUGU);
    assert.equal(hindiHistory[0]?.word.language, LanguageEnum.HINDI);

    const teluguStats = await storage.getUserStats(learnerUserId, LanguageEnum.TELUGU);
    const hindiStats = await storage.getUserStats(learnerUserId, LanguageEnum.HINDI);
    assert.equal(teluguStats.mastered, 1);
    assert.equal(hindiStats.mastered, 0);
    assert.equal(teluguStats.weak, 0);
    assert.equal(hindiStats.weak, 1);
    assert.equal(teluguStats.recallAccuracy, 100);
    assert.equal(hindiStats.recognitionAccuracy, 0);

    const teluguCandidates = await storage.getQuizCandidates(
      learnerUserId,
      10,
      teluguCluster.id,
      QuizModeEnum.CLUSTER,
      LanguageEnum.TELUGU,
    );
    const hindiCandidates = await storage.getQuizCandidates(
      learnerUserId,
      10,
      hindiCluster.id,
      QuizModeEnum.CLUSTER,
      LanguageEnum.HINDI,
    );
    assert.deepEqual(
      teluguCandidates.map((row) => row.language),
      [LanguageEnum.TELUGU],
    );
    assert.deepEqual(
      hindiCandidates.map((row) => row.language),
      [LanguageEnum.HINDI],
    );

    const teluguWords = await storage.getWords(20, LanguageEnum.TELUGU);
    const hindiWords = await storage.getWords(20, LanguageEnum.HINDI);
    assert.ok(teluguWords.every((row) => row.language === LanguageEnum.TELUGU));
    assert.ok(hindiWords.every((row) => row.language === LanguageEnum.HINDI));

    const teluguClusters = await storage.getClusters(LanguageEnum.TELUGU);
    const hindiClusters = await storage.getClusters(LanguageEnum.HINDI);
    assert.ok(teluguClusters.some((cluster) => cluster.id === teluguCluster.id));
    assert.ok(!teluguClusters.some((cluster) => cluster.id === hindiCluster.id));
    assert.ok(hindiClusters.some((cluster) => cluster.id === hindiCluster.id));
    assert.ok(!hindiClusters.some((cluster) => cluster.id === teluguCluster.id));

    const teluguLeaderboard = await storage.getLeaderboard("all_time", 10, LanguageEnum.TELUGU);
    const hindiLeaderboard = await storage.getLeaderboard("all_time", 10, LanguageEnum.HINDI);
    const hindiWeeklyLeaderboard = await storage.getLeaderboard("weekly", 10, LanguageEnum.HINDI);
    const hindiDailyLeaderboard = await storage.getLeaderboard("daily", 10, LanguageEnum.HINDI);
    const teluguLearner = teluguLeaderboard.find((row) => row.userId === learnerUserId);
    const hindiLeader = hindiLeaderboard.find((row) => row.userId === leaderboardUserId);
    const hindiWeeklyLeader = hindiWeeklyLeaderboard.find((row) => row.userId === leaderboardUserId);
    const hindiDailyLeader = hindiDailyLeaderboard.find((row) => row.userId === leaderboardUserId);
    const hindiWeeklyLearner = hindiWeeklyLeaderboard.find((row) => row.userId === learnerUserId);
    const hindiDailyLearner = hindiDailyLeaderboard.find((row) => row.userId === learnerUserId);
    assert.ok(teluguLearner);
    assert.ok(hindiLeader);
    assert.ok(hindiWeeklyLeader);
    assert.ok(hindiDailyLeader);
    assert.equal(teluguLearner?.accuracy, 100);
    assert.equal(hindiLeader?.accuracy, 100);
    assert.ok((hindiLeader?.xp ?? 0) > (teluguLearner?.xp ?? 0));
    assert.equal(hindiLeader?.attempts, 2);
    assert.equal(hindiWeeklyLeader?.attempts, 2);
    assert.equal(hindiDailyLeader?.attempts, 2);
    assert.equal(hindiWeeklyLearner?.attempts, 1);
    assert.equal(hindiDailyLearner?.attempts, 0);
  } finally {
    await db.delete(quizAttempts).where(inArray(quizAttempts.userId, [learnerUserId, leaderboardUserId]));
    await db.delete(userWordProgress).where(inArray(userWordProgress.userId, [learnerUserId, leaderboardUserId]));

    if (createdWordIds.length > 0) {
      await db.delete(wordClusters).where(inArray(wordClusters.wordId, createdWordIds));
      await db.delete(words).where(inArray(words.id, createdWordIds));
    }

    if (createdClusterIds.length > 0) {
      await db.delete(clusters).where(inArray(clusters.id, createdClusterIds));
    }

    await db.delete(users).where(eq(users.id, learnerUserId));
    await db.delete(users).where(eq(users.id, leaderboardUserId));
  }
});
