import fs from "fs/promises";
import path from "path";

type Item = {
  telugu: string;
  transliteration: string;
  english: string;
  partOfSpeech: string;
  difficulty: number;
  difficultyLevel: "beginner" | "easy" | "medium" | "hard";
  frequencyScore: number;
  cefrLevel: string;
  tags: string[];
  clusters: string[];
  examples: {
    telugu: string;
    english: string;
    contextTag: string;
    difficulty: number;
  }[];
};

const CLUSTERS = [
  "Basics",
  "Pronouns",
  "Common Verbs",
  "Food",
  "Travel",
  "Family",
  "Numbers",
  "Time",
  "Places",
  "Emotions",
  "Questions",
  "Shopping",
  "Directions",
  "Health",
  "Work",
  "School",
  "Grammar Core",
  "Daily Actions",
  "Conversations",
  "Review Boost",
];

const POS = ["noun", "verb", "adjective", "adverb", "expression"];
const LEVELS: Array<Item["difficultyLevel"]> = ["beginner", "easy", "medium", "hard"];
const CEFR = ["A1", "A1", "A2", "B1"];

function pad(num: number) {
  return String(num).padStart(3, "0");
}

function toLetters(n: number): string {
  let x = n;
  let out = "";
  while (x > 0) {
    const rem = (x - 1) % 26;
    out = String.fromCharCode(97 + rem) + out;
    x = Math.floor((x - 1) / 26);
  }
  return out;
}

function pick<T>(arr: T[], idx: number): T {
  return arr[idx % arr.length];
}

function buildItem(index: number): Item {
  const n = index + 1;
  const code = pad(n);
  const clusterPrimary = pick(CLUSTERS, index);
  const clusterSecondary = pick(CLUSTERS, index + 7);
  const level = pick(LEVELS, Math.floor(index / 75));
  const pos = pick(POS, index);
  const difficulty = Math.min(4, Math.max(1, Math.floor(index / 75) + 1));
  const freqRaw = 0.95 - index * 0.0025;
  const frequencyScore = Number(Math.max(0.1, Math.min(0.99, freqRaw)).toFixed(2));

  const teluguWord = `పదం${code}`;
  const englishWord = `word-${code}`;

  return {
    telugu: teluguWord,
    transliteration: `padam-${toLetters(n)}`,
    english: englishWord,
    partOfSpeech: pos,
    difficulty,
    difficultyLevel: level,
    frequencyScore,
    cefrLevel: pick(CEFR, Math.floor(index / 75)),
    tags: ["mvp", level, pos],
    clusters: [clusterPrimary, clusterSecondary],
    examples: [
      {
        telugu: `నేను ${teluguWord} నేర్చుకుంటున్నాను.`,
        english: `I am learning ${englishWord}.`,
        contextTag: "learning",
        difficulty,
      },
    ],
  };
}

async function main() {
  const total = Number(process.argv[2] ?? 300);
  const outputPath = process.argv[3] ?? "assets/processed/words.mvp.json";

  if (!Number.isInteger(total) || total < 1) {
    throw new Error("Total must be a positive integer");
  }

  const rows: Item[] = Array.from({ length: total }, (_, i) => buildItem(i));

  const fullPath = path.resolve(process.cwd(), outputPath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, `${JSON.stringify(rows, null, 2)}\n`, "utf-8");

  console.log(`Generated ${rows.length} rows at ${outputPath}`);
  console.log(`Cluster count in dataset: ${new Set(rows.flatMap((r) => r.clusters)).size}`);
  console.log(`Example count in dataset: ${rows.reduce((sum, row) => sum + row.examples.length, 0)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
