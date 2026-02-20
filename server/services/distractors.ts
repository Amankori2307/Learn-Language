import type { Word } from "@shared/schema";

function transliterationSimilarity(a: string, b: string) {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  let i = 0;
  while (i < x.length && i < y.length && x[i] === y[i]) i += 1;
  return i;
}

export function chooseDistractors(params: {
  word: Word;
  allWords: Word[];
  clusterByWord: Map<number, Set<number>>;
  count?: number;
  random?: () => number;
}): Word[] {
  const count = params.count ?? 3;
  const rand = params.random ?? Math.random;
  const wordClusters = params.clusterByWord.get(params.word.id) ?? new Set<number>();

  const scored = params.allWords
    .filter((candidate) => candidate.id !== params.word.id)
    .map((candidate) => {
      const candidateClusters = params.clusterByWord.get(candidate.id) ?? new Set<number>();
      let sameCluster = 0;
      candidateClusters.forEach((cid) => {
        if (sameCluster === 0 && wordClusters.has(cid)) {
          sameCluster = 1;
        }
      });
      const samePos = candidate.partOfSpeech === params.word.partOfSpeech ? 1 : 0;
      const translitScore = transliterationSimilarity(candidate.transliteration, params.word.transliteration);

      return {
        candidate,
        sameCluster,
        samePos,
        translitScore,
        fallbackRandom: rand(),
      };
    });

  scored.sort((a, b) => {
    if (b.sameCluster !== a.sameCluster) return b.sameCluster - a.sameCluster;
    if (b.samePos !== a.samePos) return b.samePos - a.samePos;
    if (b.translitScore !== a.translitScore) return b.translitScore - a.translitScore;
    if (a.fallbackRandom !== b.fallbackRandom) return a.fallbackRandom - b.fallbackRandom;
    return a.candidate.id - b.candidate.id;
  });

  const out: Word[] = [];
  const used = new Set<number>([params.word.id]);
  for (const item of scored) {
    if (used.has(item.candidate.id)) continue;
    used.add(item.candidate.id);
    out.push(item.candidate);
    if (out.length >= count) break;
  }

  return out;
}
