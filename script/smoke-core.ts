import { storage } from "../server/storage";

async function main() {
  const userId = "smoke-user";

  const words = await storage.getWords(20);
  if (words.length === 0) {
    throw new Error("Smoke failed: no words available");
  }

  const clusters = await storage.getClusters();
  if (clusters.length === 0) {
    throw new Error("Smoke failed: no clusters available");
  }

  const quiz = await storage.getQuizCandidates(userId, 10, undefined, "daily_review");
  if (quiz.length === 0) {
    throw new Error("Smoke failed: no quiz candidates generated");
  }

  const stats = await storage.getUserStats(userId);

  console.log("Smoke core PASS");
  console.log(`words_sample=${words.length}`);
  console.log(`clusters_total=${clusters.length}`);
  console.log(`quiz_count=${quiz.length}`);
  console.log(`stats_total_words=${stats.totalWords}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
