import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const DOMAIN_NAMES = [
  "full",
  "markdown",
  "shell",
  "governance",
  "format",
  "ts",
  "browser",
] as const;

export type CiDomain = (typeof DOMAIN_NAMES)[number];

export type CiChangeClassification = Record<CiDomain, boolean>;

export function classifyCiChanges(files: string[]): CiChangeClassification {
  const classification = emptyClassification();

  for (const file of files) {
    if (isShellPath(file)) {
      classification.shell = true;
      continue;
    }

    if (file === "scripts/classify-ci-changes.ts") {
      classification.full = true;
      continue;
    }

    if (/^scripts\/.*\.ts$/.test(file)) {
      classification.format = true;
      classification.governance = true;
      classification.ts = true;
      continue;
    }

    if (file === "trace/phase1/phase-exit-demo.md") {
      classification.markdown = true;
      classification.governance = true;
      classification.ts = true;
      continue;
    }

    if (
      file === "AGENTS.md" ||
      file === "CLAUDE.md" ||
      file === "GEMINI.md" ||
      file === "STATUS.yaml" ||
      file.startsWith("docs/adr/") ||
      file.startsWith("docs/design/") ||
      file.startsWith("spec/") ||
      file.startsWith("trace/") ||
      file.startsWith("prompt/") ||
      file.startsWith("memory/")
    ) {
      classification.markdown = isMarkdown(file) || classification.markdown;
      classification.governance = true;
      continue;
    }

    if (/^packages\/.*\.(ts|tsx)$/.test(file)) {
      classification.format = true;
      classification.ts = true;
      if (!file.endsWith(".test.ts") && !file.endsWith(".test.tsx")) {
        classification.browser = true;
      }
      continue;
    }

    if (/^tests\/browser\/.*\.ts$/.test(file)) {
      classification.browser = true;
      classification.format = true;
      classification.ts = true;
      continue;
    }

    if (file.startsWith("skills/cadenza/")) {
      classification.format = isBiomeFormatted(file) || classification.format;
      classification.markdown = isMarkdown(file) || classification.markdown;
      classification.governance = true;
      classification.ts = true;
      continue;
    }

    if (isMarkdown(file)) {
      classification.markdown = true;
      continue;
    }

    classification.full = true;
  }

  return classification;
}

function isMarkdown(file: string): boolean {
  return file.endsWith(".md") || file.endsWith(".mdx");
}

function isBiomeFormatted(file: string): boolean {
  return /\.(cjs|css|js|json|jsonc|jsx|mjs|ts|tsx)$/.test(file);
}

function isShellPath(file: string): boolean {
  return (
    file.endsWith(".sh") ||
    file.startsWith(".githooks/") ||
    file === ".editorconfig"
  );
}

function emptyClassification(): CiChangeClassification {
  return {
    browser: false,
    format: false,
    full: false,
    governance: false,
    markdown: false,
    shell: false,
    ts: false,
  };
}

function git(args: string[]): string {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status === 0) {
    return result.stdout.trim();
  }
  throw (
    result.error ?? new Error(result.stderr || `git ${args.join(" ")} failed`)
  );
}

function changedSince(base: string): string[] {
  const output = git([
    "diff",
    "--name-only",
    "--diff-filter=ACMRTD",
    `${base}...HEAD`,
  ]);
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function workingTreeFiles(): string[] {
  const output = git(["diff", "--name-only", "--diff-filter=ACMRTD", "HEAD"]);
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

export function formatGitHubOutputs(
  classification: CiChangeClassification,
): string {
  return DOMAIN_NAMES.map(
    (domain) => `${domain}=${classification[domain]}`,
  ).join("\n");
}

function argValue(args: string[], name: string): string | null {
  const index = args.indexOf(name);
  return index >= 0 ? (args[index + 1] ?? null) : null;
}

function main() {
  const args = process.argv.slice(2);
  const files = args.includes("--all")
    ? ["package.json"]
    : argValue(args, "--base")
      ? changedSince(argValue(args, "--base") as string)
      : workingTreeFiles();

  console.log(formatGitHubOutputs(classifyCiChanges(files)));
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
