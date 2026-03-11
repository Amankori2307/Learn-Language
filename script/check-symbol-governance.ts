import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const TARGET_DIRS = ["client", "server", "shared"];
const CODE_EXTENSIONS = new Set([".ts", ".tsx"]);
const IGNORED_DIR_NAMES = new Set(["node_modules", ".next", "dist", "coverage", ".git"]);
const ALLOWED_ENUM_PATHS = new Set([
  "shared/domain/enums.ts",
  "server/src/infrastructure/database.enums.ts",
]);
const DUPLICATE_EXCLUDED_PREFIXES = ["server/src/infrastructure/tables/"];
const FORBIDDEN_EXPORT_FILE_PATTERNS = [".controller.ts", ".service.ts", ".repository.ts"];

type SymbolKind = "type" | "interface" | "enum";

type ExportedSymbol = {
  filePath: string;
  kind: SymbolKind;
  name: string;
  line: number;
};

type Violation = {
  filePath: string;
  line?: number;
  reason: string;
};

async function collectFiles(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (IGNORED_DIR_NAMES.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (CODE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function getLineNumber(content: string, offset: number): number {
  return content.slice(0, offset).split("\n").length;
}

function collectExportedSymbols(relativePath: string, content: string): ExportedSymbol[] {
  const matches = content.matchAll(/export\s+(type|interface|enum)\s+([A-Za-z0-9_]+)/g);
  const symbols: ExportedSymbol[] = [];

  for (const match of matches) {
    const offset = match.index ?? 0;
    symbols.push({
      filePath: relativePath,
      kind: match[1] as SymbolKind,
      name: match[2],
      line: getLineNumber(content, offset),
    });
  }

  return symbols;
}

function isExcludedFromDuplicateCheck(filePath: string): boolean {
  return DUPLICATE_EXCLUDED_PREFIXES.some((prefix) => filePath.startsWith(prefix));
}

async function main() {
  const files = (
    await Promise.all(
      TARGET_DIRS.map(async (dir) => {
        const dirPath = path.join(ROOT, dir);
        try {
          return await collectFiles(dirPath);
        } catch {
          return [];
        }
      }),
    )
  ).flat();

  const violations: Violation[] = [];
  const exportedSymbols: ExportedSymbol[] = [];

  for (const filePath of files) {
    const relativePath = path.relative(ROOT, filePath);
    const content = await fs.readFile(filePath, "utf-8");
    const symbols = collectExportedSymbols(relativePath, content);
    exportedSymbols.push(...symbols);

    if (symbols.length === 0) {
      continue;
    }

    for (const symbol of symbols) {
      if (symbol.kind === "enum" && !ALLOWED_ENUM_PATHS.has(relativePath)) {
        violations.push({
          filePath: relativePath,
          line: symbol.line,
          reason: `Exported enum \`${symbol.name}\` must live in an approved enum module.`,
        });
      }

      if (
        FORBIDDEN_EXPORT_FILE_PATTERNS.some((pattern) => relativePath.endsWith(pattern)) &&
        (symbol.kind === "type" || symbol.kind === "interface" || symbol.kind === "enum")
      ) {
        violations.push({
          filePath: relativePath,
          line: symbol.line,
          reason: `Reusable exported ${symbol.kind} \`${symbol.name}\` must move out of controller/service/repository files.`,
        });
      }
    }
  }

  const duplicateMap = new Map<string, ExportedSymbol[]>();
  for (const symbol of exportedSymbols) {
    if (isExcludedFromDuplicateCheck(symbol.filePath)) {
      continue;
    }

    const key = symbol.name;
    const existing = duplicateMap.get(key) ?? [];
    existing.push(symbol);
    duplicateMap.set(key, existing);
  }

  for (const [name, symbols] of duplicateMap.entries()) {
    if (symbols.length < 2) {
      continue;
    }

    const locations = symbols
      .map((symbol) => `${symbol.filePath}:${symbol.line}`)
      .sort()
      .join(", ");

    for (const symbol of symbols) {
      violations.push({
        filePath: symbol.filePath,
        line: symbol.line,
        reason: `Duplicate exported symbol \`${name}\` detected. Consolidate ownership. Also found at: ${locations}.`,
      });
    }
  }

  if (violations.length > 0) {
    console.error("Symbol governance check failed:");
    for (const violation of violations) {
      const location = violation.line ? `${violation.filePath}:${violation.line}` : violation.filePath;
      console.error(`- ${location}: ${violation.reason}`);
    }
    process.exit(1);
  }

  console.log(`Symbol governance check passed (${files.length} files scanned).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
