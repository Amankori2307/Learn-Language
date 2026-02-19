import { db } from "./db";
import { eq, sql, and, desc, lt, gte } from "drizzle-orm";
import {
  words, clusters, wordClusters, userWordProgress, quizAttempts,
  type Word, type Cluster, type UserWordProgress, type QuizAttempt,
  type CreateWordRequest, type CreateClusterRequest, type SubmitAnswerRequest
} from "@shared/schema";

export interface IStorage {
  // Words & Clusters
  getWords(limit?: number): Promise<Word[]>;
  getWord(id: number): Promise<Word | undefined>;
  getWordsByCluster(clusterId: number): Promise<Word[]>;
  createWord(word: CreateWordRequest): Promise<Word>;
  
  getClusters(): Promise<Cluster[]>;
  getCluster(id: number): Promise<(Cluster & { words: Word[] }) | undefined>;
  createCluster(cluster: CreateClusterRequest): Promise<Cluster>;
  addWordToCluster(wordId: number, clusterId: number): Promise<void>;

  // User Progress
  getUserProgress(userId: string): Promise<UserWordProgress[]>;
  getUserWordProgress(userId: string, wordId: number): Promise<UserWordProgress | undefined>;
  updateUserProgress(progress: UserWordProgress): Promise<UserWordProgress>;
  createUserProgress(progress: Omit<UserWordProgress, "id">): Promise<UserWordProgress>;
  
  // Quiz
  logQuizAttempt(attempt: Omit<QuizAttempt, "id" | "createdAt">): Promise<QuizAttempt>;
  getQuizCandidates(userId: string, limit?: number, clusterId?: number): Promise<Word[]>;
  
  // Stats
  getUserStats(userId: string): Promise<{
    totalWords: number;
    mastered: number;
    learning: number;
    weak: number;
    streak: number;
    xp: number;
  }>;

  // Admin/Seed
  seedInitialData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getWords(limit: number = 100): Promise<Word[]> {
    return await db.select().from(words).limit(limit);
  }

  async getWord(id: number): Promise<Word | undefined> {
    const [word] = await db.select().from(words).where(eq(words.id, id));
    return word;
  }

  async getWordsByCluster(clusterId: number): Promise<Word[]> {
    const results = await db.select({
      word: words
    })
    .from(wordClusters)
    .innerJoin(words, eq(wordClusters.wordId, words.id))
    .where(eq(wordClusters.clusterId, clusterId));
    
    return results.map(r => r.word);
  }

  async createWord(word: CreateWordRequest): Promise<Word> {
    const [newWord] = await db.insert(words).values(word).returning();
    return newWord;
  }

  async getClusters(): Promise<Cluster[]> {
    return await db.select().from(clusters);
  }

  async getCluster(id: number): Promise<(Cluster & { words: Word[] }) | undefined> {
    const [cluster] = await db.select().from(clusters).where(eq(clusters.id, id));
    if (!cluster) return undefined;

    const clusterWords = await this.getWordsByCluster(id);
    return { ...cluster, words: clusterWords };
  }

  async createCluster(cluster: CreateClusterRequest): Promise<Cluster> {
    const [newCluster] = await db.insert(clusters).values(cluster).returning();
    return newCluster;
  }

  async addWordToCluster(wordId: number, clusterId: number): Promise<void> {
    await db.insert(wordClusters).values({ wordId, clusterId }).onConflictDoNothing();
  }

  async getUserProgress(userId: string): Promise<UserWordProgress[]> {
    return await db.select().from(userWordProgress).where(eq(userWordProgress.userId, userId));
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
      .where(eq(userWordProgress.id, progress.id))
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

  // Implementation of the "Word Selection Algorithm" from PRD
  async getQuizCandidates(userId: string, limit: number = 10, clusterId?: number): Promise<Word[]> {
    // 1. Get pool of words
    let candidateWords: Word[] = [];
    if (clusterId) {
      candidateWords = await this.getWordsByCluster(clusterId);
    } else {
      candidateWords = await this.getWords(500);
    }

    // 2. Get user progress
    const progressList = await this.getUserProgress(userId);
    const progressMap = new Map(progressList.map(p => [p.wordId, p]));

    // 3. Score based on PRD: difficulty_weight + days_since_last_seen + (wrong_count * 2) - correct_streak
    const scoredWords = candidateWords.map(word => {
      const progress = progressMap.get(word.id);
      
      let score = 0;
      if (!progress) {
        // New words have baseline priority
        score = (word.difficulty || 1) * 2 + 50; 
      } else {
        const lastSeenDate = progress.lastSeen ? new Date(progress.lastSeen) : new Date(0);
        const daysSinceLastSeen = Math.floor((Date.now() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24));
        
        score = (word.difficulty || 1) 
          + daysSinceLastSeen 
          + ((progress.wrongCount || 0) * 2) 
          - (progress.correctStreak || 0);

        // Filter out mastered words unless they are due for review
        if ((progress.masteryLevel || 0) >= 4) {
          const isDue = progress.nextReview && new Date(progress.nextReview) <= new Date();
          if (!isDue) score = -1000; // Deprioritize significantly
        }
      }
      return { word, score };
    });

    // 4. Sort and return top N
    return scoredWords
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.word);
  }

  async getUserStats(userId: string): Promise<{
    totalWords: number;
    mastered: number;
    learning: number;
    weak: number;
    streak: number;
    xp: number;
  }> {
    const progressList = await this.getUserProgress(userId);
    
    // Total words in DB (approximate)
    const totalWordsResult = await db.select({ count: sql<number>`count(*)` }).from(words);
    const totalWords = Number(totalWordsResult[0].count);

    const mastered = progressList.filter(p => (p.masteryLevel || 0) >= 4).length;
    const learning = progressList.filter(p => (p.masteryLevel || 0) > 0 && (p.masteryLevel || 0) < 4).length;
    
    // Weak: wrongCount > 2 or overdue
    const now = new Date();
    const weak = progressList.filter(p => 
      (p.wrongCount || 0) > 2 || 
      (p.nextReview && new Date(p.nextReview) < now)
    ).length;

    // Calculate streak from quizAttempts (simplified: count unique days with activity in last N days)
    // For MVP, just using a stored value or simple count
    const streak = 0; // TODO: Implement real streak logic
    
    // Calculate XP: sum of correct attempts * 10
    const [xpResult] = await db.select({ 
      xp: sql<number>`count(*) * 10` 
    }).from(quizAttempts)
    .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.isCorrect, true)));
    
    return {
      totalWords,
      mastered,
      learning,
      weak,
      streak,
      xp: Number(xpResult?.xp || 0)
    };
  }

  async seedInitialData(): Promise<void> {
    const existing = await this.getWords(1);
    if (existing.length > 0) return;

    // Clusters
    const c_basics = await this.createCluster({ name: "Basics", type: "semantic", description: "Essential survival words" });
    const c_food = await this.createCluster({ name: "Food", type: "semantic", description: "Fruits, vegetables, and dining" });
    const c_pronouns = await this.createCluster({ name: "Pronouns", type: "grammar", description: "I, You, We, They" });

    // Words
    const wordsData = [
      // Pronouns
      { telugu: "నేను", transliteration: "nēnu", english: "I", partOfSpeech: "pronoun", clusterId: c_pronouns.id },
      { telugu: "నువ్వు", transliteration: "nuvvu", english: "You (informal)", partOfSpeech: "pronoun", clusterId: c_pronouns.id },
      { telugu: "మీరు", transliteration: "mīru", english: "You (formal)", partOfSpeech: "pronoun", clusterId: c_pronouns.id },
      { telugu: "మేము", transliteration: "mēmu", english: "We", partOfSpeech: "pronoun", clusterId: c_pronouns.id },
      
      // Basics
      { telugu: "నమస్కారం", transliteration: "namaskāram", english: "Hello / Greetings", partOfSpeech: "noun", clusterId: c_basics.id },
      { telugu: "ధన్యవాదాలు", transliteration: "dhanyavādālu", english: "Thank you", partOfSpeech: "noun", clusterId: c_basics.id },
      { telugu: "అవును", transliteration: "avunu", english: "Yes", partOfSpeech: "adverb", clusterId: c_basics.id },
      { telugu: "కాదు", transliteration: "kādu", english: "No", partOfSpeech: "adverb", clusterId: c_basics.id },
      
      // Food
      { telugu: "ఆపిల్", transliteration: "āpil", english: "Apple", partOfSpeech: "noun", clusterId: c_food.id },
      { telugu: "నీరు", transliteration: "nīru", english: "Water", partOfSpeech: "noun", clusterId: c_food.id },
      { telugu: "ఆహారం", transliteration: "āhāram", english: "Food", partOfSpeech: "noun", clusterId: c_food.id },
      { telugu: "పాలు", transliteration: "pālu", english: "Milk", partOfSpeech: "noun", clusterId: c_food.id },
    ];

    for (const w of wordsData) {
      const { clusterId, ...wordData } = w;
      const word = await this.createWord(wordData);
      await this.addWordToCluster(word.id, clusterId);
    }
    
    console.log("Database seeded successfully!");
  }
}

export const storage = new DatabaseStorage();
