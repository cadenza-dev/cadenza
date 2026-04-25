import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const role = process.env.CADENZA_AGENT_ROLE;

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

function readCurrentOrHead(file: string): string {
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

function isAcceptedAdr(file: string): boolean {
  return (
    /^docs\/adr\/[0-9]{4}-.*\.md$/.test(file) &&
    /Status:\s*Accepted/m.test(readCurrentOrHead(file))
  );
}

function isFrozenSpec(file: string): boolean {
  return (
    /^spec\/.*\.md$/.test(file) &&
    /^Status:\s*CONTRACT_FROZEN$/m.test(readCurrentOrHead(file))
  );
}

if (!role) {
  console.log("check:role-boundary skipped (CADENZA_AGENT_ROLE unset)");
  process.exit(0);
}

const files = stagedFiles();
const violations: string[] = [];

for (const file of files) {
  if (role === "architect" && /^packages\/[^/]+\/src\//.test(file)) {
    violations.push(`${file} (architect must not write production src)`);
  }
  if (role === "builder" && (isFrozenSpec(file) || isAcceptedAdr(file))) {
    violations.push(
      `${file} (builder must not modify frozen specs or Accepted ADRs)`,
    );
  }
  if (role === "scout" && /^(spec|packages|docs\/adr)\//.test(file)) {
    violations.push(
      `${file} (scout must not write spec/, packages/, or docs/adr/)`,
    );
  }
}

if (violations.length > 0) {
  console.error(`check:role-boundary failed for CADENZA_AGENT_ROLE=${role}`);
  for (const violation of violations) {
    console.error(`  - ${violation}`);
  }
  process.exit(1);
}

console.log(`check:role-boundary OK (${role})`);
