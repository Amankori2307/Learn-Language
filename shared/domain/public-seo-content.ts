import words from "../../assets/processed/words.json";
import { getClusterDescription } from "./cluster-metadata";

type SeedWord = {
  language: string;
  originalScript: string;
  transliteration?: string | null;
  english: string;
  clusters?: string[];
};

const seedWords = words as SeedWord[];

export const PUBLIC_LANGUAGE_PAGES = [
  {
    slug: "telugu",
    title: "Learn Telugu Vocabulary",
    description:
      "Build Telugu vocabulary with spaced repetition, pronunciation-aware practice, and structured review flows.",
    hero:
      "Learn Telugu through adaptive review, listening-aware prompts, and cluster-based vocabulary practice.",
  },
] as const;

export function getPublicLanguagePage(slug: string) {
  return PUBLIC_LANGUAGE_PAGES.find((page) => page.slug === slug);
}

export function getSeedWordsForLanguage(language: string) {
  return seedWords.filter((word) => word.language === language);
}

export function getTopClustersForLanguage(language: string, limit: number) {
  const counts = new Map<string, number>();

  for (const word of getSeedWordsForLanguage(language)) {
    for (const cluster of word.clusters ?? []) {
      counts.set(cluster, (counts.get(cluster) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([slug, wordCount]) => ({
      slug,
      wordCount,
      description: getClusterDescription(slug),
    }));
}

export function getSampleWordsForLanguage(language: string, limit: number) {
  return getSeedWordsForLanguage(language).slice(0, limit);
}

export function getTopPublicTopics(limit: number) {
  const counts = new Map<string, number>();

  for (const word of seedWords) {
    for (const cluster of word.clusters ?? []) {
      counts.set(cluster, (counts.get(cluster) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([slug, wordCount]) => ({
      slug,
      wordCount,
      description: getClusterDescription(slug),
    }));
}
