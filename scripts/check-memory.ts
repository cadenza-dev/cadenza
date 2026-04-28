import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

type Finding = {
  level: "error" | "info";
  message: string;
};

const repoRoot = process.cwd();
const findings: Finding[] = [];

function repoPath(file: string): string {
  return path.join(repoRoot, file);
}

function readText(file: string): string {
  return readFileSync(repoPath(file), "utf8");
}

function requirePath(file: string) {
  if (!existsSync(repoPath(file))) {
    findings.push({ level: "error", message: `missing ${file}` });
  }
}

function walkMarkdown(dir: string): string[] {
  const absolute = repoPath(dir);
  if (!existsSync(absolute)) {
    return [];
  }

  const files: string[] = [];
  for (const entry of readdirSync(absolute)) {
    const child = path.posix.join(dir, entry);
    const stats = statSync(repoPath(child));
    if (stats.isDirectory()) {
      files.push(...walkMarkdown(child));
    } else if (child.endsWith(".md")) {
      files.push(child);
    }
  }
  return files;
}

for (const file of [
  "memory/README.md",
  "memory/index.md",
  "memory/lessons/human/README.md",
  "memory/lessons/reviewer/README.md",
]) {
  requirePath(file);
}

for (const lesson of walkMarkdown("memory/lessons")) {
  if (lesson.endsWith("/README.md")) {
    continue;
  }

  const text = readText(lesson);
  if (!text.startsWith("---\n")) {
    findings.push({
      level: "error",
      message: `${lesson} is missing YAML frontmatter`,
    });
    continue;
  }

  for (const field of ["id", "source", "severity", "status"]) {
    if (!new RegExp(`^${field}:\\s*\\S+`, "m").test(text)) {
      findings.push({
        level: "error",
        message: `${lesson} missing frontmatter field ${field}`,
      });
    }
  }

  if (!/^source:\s*(human|reviewer)\s*$/m.test(text)) {
    findings.push({
      level: "error",
      message: `${lesson} source must be human or reviewer`,
    });
  }
}

const errorCount = findings.filter(
  (finding) => finding.level === "error",
).length;
for (const finding of findings) {
  console.log(`${finding.level}: ${finding.message}`);
}

if (errorCount > 0) {
  console.log(`check:memory failed (${errorCount} error(s))`);
  process.exit(1);
}

console.log("check:memory OK");
