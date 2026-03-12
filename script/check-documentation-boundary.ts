import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const documentationRoot = path.join(repoRoot, "documentation");

const ALLOWED_TOP_LEVEL_FILES = new Set(["README.md"]);
const ALLOWED_TOP_LEVEL_DIRS = new Set(["product", "architecture", "operations"]);
const FORBIDDEN_NAME_PATTERNS = [
  /phase/i,
  /baseline/i,
  /matrix/i,
  /scope/i,
  /backlog/i,
  /task/i,
  /archive/i,
];

const violations: string[] = [];

function walkDocumentationDir(dirPath: string, relativeDir = "") {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDir, entry.name);
    const fullPath = path.join(dirPath, entry.name);

    if (relativeDir === "") {
      if (entry.isFile() && !ALLOWED_TOP_LEVEL_FILES.has(entry.name)) {
        violations.push(
          `Top-level file ${relativePath} is not allowed in documentation/. Move canonical docs into product/, architecture/, or operations/.`,
        );
        continue;
      }

      if (entry.isDirectory() && !ALLOWED_TOP_LEVEL_DIRS.has(entry.name)) {
        violations.push(
          `Top-level directory ${relativePath} is not allowed in documentation/. Historical or task-oriented material belongs in context/archive/, not documentation/.`,
        );
        continue;
      }
    }

    if (entry.isDirectory()) {
      walkDocumentationDir(fullPath, relativePath);
      continue;
    }

    if (!entry.name.endsWith(".md")) {
      violations.push(`Non-markdown file ${relativePath} found in documentation/.`);
      continue;
    }

    if (relativeDir !== "") {
      for (const pattern of FORBIDDEN_NAME_PATTERNS) {
        if (pattern.test(entry.name)) {
          violations.push(
            `File ${relativePath} looks task-oriented or historical. Keep documentation/ for canonical docs only and move planning/history material into context/.`,
          );
          break;
        }
      }
    }
  }
}

if (!fs.existsSync(documentationRoot)) {
  console.error("documentation/ directory is missing.");
  process.exit(1);
}

walkDocumentationDir(documentationRoot);

if (violations.length > 0) {
  console.error("Documentation boundary check failed:\n");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Documentation boundary check passed.");
