import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const repoRoot = process.cwd();

function argValue(name: string): string | null {
  const index = args.indexOf(name);
  if (index >= 0 && args[index + 1]) {
    return args[index + 1];
  }
  return null;
}

function git(args: string[]): string {
  const result = spawnSync("git", args, { cwd: repoRoot, encoding: "utf8" });
  if (result.status === 0) {
    return result.stdout.trim();
  }
  throw (
    result.error ?? new Error(result.stderr || `git ${args.join(" ")} failed`)
  );
}

function stagedFiles(): string[] {
  const output = git([
    "diff",
    "--cached",
    "--name-only",
    "--diff-filter=ACMRT",
  ]);
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function changedSince(base: string): string[] {
  const output = git([
    "diff",
    "--name-only",
    "--diff-filter=ACMRT",
    `${base}...HEAD`,
  ]);
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function commitMessagesSince(base: string): string {
  return git(["log", "--format=%B", `${base}..HEAD`]);
}

function workingTreeFiles(): string[] {
  const output = git(["diff", "--name-only", "--diff-filter=ACMRT", "HEAD"]);
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function fileText(file: string): string {
  const absolute = path.join(repoRoot, file);
  if (existsSync(absolute)) {
    return readFileSync(absolute, "utf8");
  }
  try {
    return git(["show", `HEAD:${file}`]);
  } catch {
    return "";
  }
}

function isFrozen(file: string): boolean {
  const text = fileText(file);
  return (
    /^Status:\s*CONTRACT_FROZEN$/m.test(text) ||
    /Status:\s*Accepted/m.test(text)
  );
}

const commitMsgPath = argValue("--commit-msg");
const base = argValue("--base");
const files =
  args.includes("--staged") || commitMsgPath
    ? stagedFiles()
    : base
      ? changedSince(base)
      : workingTreeFiles();
const frozenFiles = files
  .filter((file) => /\.(md|mdx)$/.test(file))
  .filter(isFrozen);

if (frozenFiles.length === 0) {
  console.log("check:frozen OK");
  process.exit(0);
}

const commitMessage =
  commitMsgPath && existsSync(commitMsgPath)
    ? readFileSync(commitMsgPath, "utf8")
    : "";
if (commitMsgPath && commitMessage.includes("[FREEZE-OVERRIDE]")) {
  console.log("check:frozen OK ([FREEZE-OVERRIDE] present)");
  process.exit(0);
}

if (base && commitMessagesSince(base).includes("[FREEZE-OVERRIDE]")) {
  console.log("check:frozen OK ([FREEZE-OVERRIDE] present in commit range)");
  process.exit(0);
}

console.error(
  "check:frozen failed: staged CONTRACT_FROZEN or Accepted files require explicit override.",
);
for (const file of frozenFiles) {
  console.error(`  - ${file}`);
}
console.error("");
console.error(
  "If the maintainer approved this in the current session, include [FREEZE-OVERRIDE] in the commit message.",
);
process.exit(1);
