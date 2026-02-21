import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const TARGET_DIRS = ["client", "server", "shared", "script", "docker"];
const ALLOWED_SEED_PATH = "assets/processed/seed.json";
const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".json"]);

type Violation = {
  filePath: string;
  reason: string;
  snippet: string;
};

async function collectFiles(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") {
        continue;
      }
      files.push(...(await collectFiles(fullPath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name);
    if (CODE_EXTENSIONS.has(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

function firstLineMatch(content: string, pattern: RegExp): string {
  const match = content.match(pattern);
  if (!match) {
    return "";
  }
  const [line] = match[0].split("\n");
  return line;
}

async function main() {
  const files = (await Promise.all(
    TARGET_DIRS.map(async (dir) => {
      const dirPath = path.join(ROOT, dir);
      try {
        return await collectFiles(dirPath);
      } catch {
        return [];
      }
    }),
  )).flat();

  const violations: Violation[] = [];

  for (const filePath of files) {
    const content = await fs.readFile(filePath, "utf-8");
    const relativePath = path.relative(ROOT, filePath);
    if (relativePath === "script/verify-seed-single-source.ts") {
      continue;
    }

    if (/\bwordsData\b/.test(content)) {
      violations.push({
        filePath: relativePath,
        reason: "Forbidden fallback identifier `wordsData` found.",
        snippet: firstLineMatch(content, /\bwordsData\b.*/),
      });
    }

    const processedSeedMatches = [...content.matchAll(/assets\/processed\/([a-zA-Z0-9._-]+\.json)/g)];
    for (const match of processedSeedMatches) {
      const matchedPath = `assets/processed/${match[1]}`;
      if (matchedPath !== ALLOWED_SEED_PATH) {
        violations.push({
          filePath: relativePath,
          reason: `Only ${ALLOWED_SEED_PATH} is allowed as seed source.`,
          snippet: match[0],
        });
      }
    }
  }

  if (violations.length > 0) {
    console.error("Single-source seed verification failed:");
    for (const violation of violations) {
      console.error(`- ${violation.filePath}: ${violation.reason} (${violation.snippet})`);
    }
    process.exit(1);
  }

  console.log(`Seed single-source verification passed (${files.length} files scanned).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
