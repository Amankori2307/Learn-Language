import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const activeTasksDir = path.join(repoRoot, "context", "active-tasks");
const futureTasksDir = path.join(repoRoot, "context", "future-tasks");
const archiveDir = path.join(repoRoot, "context", "archive");

const ACTIVE_ALLOWED_FILES = new Set(["app-context.md", "backlog.md"]);
const ACTIVE_PHASE_FILE_PATTERN = /^phase-[a-z0-9-]+\.md$/;

const violations: string[] = [];

function readFile(filePath: string) {
  return fs.readFileSync(filePath, "utf8");
}

function getMarkdownFiles(dirPath: string) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name);
}

function requireExists(dirPath: string, label: string) {
  if (!fs.existsSync(dirPath)) {
    violations.push(`${label} is missing.`);
    return false;
  }

  return true;
}

function checkActiveTasks() {
  if (!requireExists(activeTasksDir, "context/active-tasks")) {
    return;
  }

  const files = getMarkdownFiles(activeTasksDir);
  const phaseFiles = files.filter((file) => ACTIVE_PHASE_FILE_PATTERN.test(file));

  for (const file of files) {
    if (!ACTIVE_ALLOWED_FILES.has(file) && !ACTIVE_PHASE_FILE_PATTERN.test(file)) {
      violations.push(
        `context/active-tasks/${file} is not allowed. Keep only backlog.md, app-context.md, and active phase files in this folder.`,
      );
    }
  }

  const backlogPath = path.join(activeTasksDir, "backlog.md");

  if (!fs.existsSync(backlogPath)) {
    violations.push("context/active-tasks/backlog.md is missing.");
    return;
  }

  const backlog = readFile(backlogPath);
  const noActiveTasks = /No active tasks\./.test(backlog);
  const hasDoingRow = /^\|[^|\n]+\|\s*doing\s*\|/im.test(backlog);

  if (noActiveTasks && phaseFiles.length > 0) {
    violations.push(
      "context/active-tasks/backlog.md says there are no active tasks, but active phase files still exist in context/active-tasks/.",
    );
  }

  if (!noActiveTasks && !hasDoingRow) {
    violations.push(
      "context/active-tasks/backlog.md must have either 'No active tasks.' or one explicit `doing` row for the current execution lane.",
    );
  }

  for (const phaseFile of phaseFiles) {
    if (!backlog.includes(phaseFile)) {
      violations.push(
        `Active phase file context/active-tasks/${phaseFile} is not referenced from context/active-tasks/backlog.md.`,
      );
    }

    const phaseContents = readFile(path.join(activeTasksDir, phaseFile));
    const requiredHeadings = ["## Objective", "## Phase tasks", "## Exit criteria"];

    for (const heading of requiredHeadings) {
      if (!phaseContents.includes(heading)) {
        violations.push(
          `Active phase file context/active-tasks/${phaseFile} is missing required section '${heading}'.`,
        );
      }
    }

    if (!/\|\s*ID\s*\|\s*Status\s*\|/i.test(phaseContents)) {
      violations.push(
        `Active phase file context/active-tasks/${phaseFile} must include a task table with at least ID and Status columns.`,
      );
    }
  }
}

function checkFutureTasks() {
  if (!requireExists(futureTasksDir, "context/future-tasks")) {
    return;
  }

  const files = getMarkdownFiles(futureTasksDir);

  for (const file of files) {
    if (file !== "backlog.md") {
      violations.push(
        `context/future-tasks/${file} is not allowed. Keep future planning in backlog.md unless the item is explicitly promoted into active work.`,
      );
    }
  }

  const backlogPath = path.join(futureTasksDir, "backlog.md");

  if (!fs.existsSync(backlogPath)) {
    violations.push("context/future-tasks/backlog.md is missing.");
    return;
  }

  const backlog = readFile(backlogPath);

  if (/^\|[^|\n]+\|\s*doing\s*\|/im.test(backlog)) {
    violations.push(
      "context/future-tasks/backlog.md must not contain `doing` items. Future work is not an execution board.",
    );
  }
}

function checkArchive() {
  if (!requireExists(archiveDir, "context/archive")) {
    return;
  }

  const archiveIndexPath = path.join(archiveDir, "archive-index.md");

  if (!fs.existsSync(archiveIndexPath)) {
    violations.push("context/archive/archive-index.md is missing.");
  }
}

checkActiveTasks();
checkFutureTasks();
checkArchive();

if (violations.length > 0) {
  console.error("Context workflow check failed:\n");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Context workflow check passed.");
