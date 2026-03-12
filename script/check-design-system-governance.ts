import fs from "node:fs/promises";
import path from "node:path";
import {
  designSystemGovernanceAllowlist,
  type DesignSystemGovernanceAllowlistEntry,
  type DesignSystemGovernanceRule,
} from "./design-system-governance-allowlist";

const repoRoot = process.cwd();
const targetDirs = [path.join(repoRoot, "client", "src"), path.join(repoRoot, "app")];
const ignoredDirNames = new Set(["node_modules", ".next", "dist", "coverage"]);
const scannedExtensions = new Set([".ts", ".tsx", ".css"]);

const rawPaletteClassPattern =
  /\b(?:bg|text|border|ring|from|to|via|fill|stroke|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)(?:\/[0-9]{1,3})?\b/g;
const hexColorPattern = /#[0-9a-fA-F]{3,8}\b/g;
const arbitraryLayoutPattern =
  /\b(?:w|min-w|max-w|h|min-h|max-h|p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|rounded)-\[[^\]]+\]/g;
const legacyViewportUnitPattern = /(?<![a-z])vh\b/gi;

type Violation = {
  filePath: string;
  line: number;
  rule: DesignSystemGovernanceRule | "raw-palette";
  match: string;
  reason: string;
};

function isIgnoredPath(relativePath: string) {
  return (
    relativePath.includes(`${path.sep}node_modules${path.sep}`) ||
    relativePath.includes(`${path.sep}.next${path.sep}`) ||
    relativePath.endsWith(".test.ts") ||
    relativePath.endsWith(".test.tsx")
  );
}

function shouldCheckArbitraryLayout(relativePath: string) {
  return relativePath.endsWith(".tsx") || relativePath.endsWith(".ts");
}

function isTokenBackedArbitraryValue(match: string) {
  return (
    match.includes("var(") ||
    match.includes("env(") ||
    match.includes("calc(") ||
    match.includes("min(") ||
    match.includes("max(") ||
    match.includes("--radix-") ||
    match.includes("inherit")
  );
}

function getLineNumber(content: string, offset: number) {
  return content.slice(0, offset).split("\n").length;
}

function isAllowlisted(filePath: string, rule: DesignSystemGovernanceRule, match: string) {
  return designSystemGovernanceAllowlist.some((entry: DesignSystemGovernanceAllowlistEntry) => {
    return entry.filePath === filePath && entry.rule === rule && entry.match === match;
  });
}

async function collectFiles(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (ignoredDirNames.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
      continue;
    }

    if (!entry.isFile() || !scannedExtensions.has(path.extname(entry.name))) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function collectViolations(relativePath: string, content: string): Violation[] {
  const violations: Violation[] = [];

  for (const match of content.matchAll(rawPaletteClassPattern)) {
    const token = match[0];
    const line = getLineNumber(content, match.index ?? 0);

    violations.push({
      filePath: relativePath,
      line,
      rule: "raw-palette",
      match: token,
      reason: `Raw Tailwind palette class \`${token}\` bypasses Continuum semantic tokens.`,
    });
  }

  for (const match of content.matchAll(hexColorPattern)) {
    const token = match[0];
    const line = getLineNumber(content, match.index ?? 0);

    if (isAllowlisted(relativePath, "hex-color", token)) {
      continue;
    }

    violations.push({
      filePath: relativePath,
      line,
      rule: "hex-color",
      match: token,
      reason: `Raw hex color \`${token}\` bypasses Continuum semantic token ownership.`,
    });
  }

  if (!shouldCheckArbitraryLayout(relativePath)) {
    return violations;
  }

  for (const match of content.matchAll(arbitraryLayoutPattern)) {
    const token = match[0];
    const line = getLineNumber(content, match.index ?? 0);

    if (isTokenBackedArbitraryValue(token) || isAllowlisted(relativePath, "arbitrary-layout", token)) {
      continue;
    }

    violations.push({
      filePath: relativePath,
      line,
      rule: "arbitrary-layout",
      match: token,
      reason: `Arbitrary layout token \`${token}\` needs a shared token, shared primitive, or explicit allowlisted exception.`,
    });
  }

  for (const match of content.matchAll(legacyViewportUnitPattern)) {
    const token = match[0];
    const line = getLineNumber(content, match.index ?? 0);

    if (isAllowlisted(relativePath, "legacy-vh", token)) {
      continue;
    }

    violations.push({
      filePath: relativePath,
      line,
      rule: "legacy-vh",
      match: token,
      reason: "Legacy viewport unit `vh` is disallowed. Use `dvh`, `svh`, or `lvh` instead.",
    });
  }

  return violations;
}

async function main() {
  const files = (
    await Promise.all(
      targetDirs.map(async (dirPath) => {
        try {
          return await collectFiles(dirPath);
        } catch {
          return [];
        }
      }),
    )
  ).flat();
  const violations: Violation[] = [];

  for (const filePath of files) {
    const relativePath = path.relative(repoRoot, filePath);
    if (isIgnoredPath(relativePath)) {
      continue;
    }

    const content = await fs.readFile(filePath, "utf8");
    violations.push(...collectViolations(relativePath, content));
  }

  if (violations.length > 0) {
    console.error("Design-system governance check failed:\n");
    for (const violation of violations) {
      console.error(`- ${violation.filePath}:${violation.line} [${violation.rule}] ${violation.reason}`);
    }
    process.exit(1);
  }

  console.log(`Design-system governance check passed (${files.length} files scanned).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
