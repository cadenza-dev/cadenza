import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const scriptPath = path.resolve("scripts/check-contract-frozen.ts");

function git(repoRoot: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function writeRepoFile(repoRoot: string, file: string, text: string) {
  const absolute = path.join(repoRoot, file);
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, text);
}

function initRepo(): string {
  const repoRoot = mkdtempSync(path.join(tmpdir(), "cadenza-frozen-check-"));
  git(repoRoot, ["init"]);
  git(repoRoot, ["config", "user.email", "test@example.com"]);
  git(repoRoot, ["config", "user.name", "Test User"]);
  writeRepoFile(
    repoRoot,
    "spec/phase3/SPEC_TEST.md",
    ["---", "Status: CONTRACT_DRAFT", "---", "", "# Test", ""].join("\n"),
  );
  git(repoRoot, ["add", "."]);
  git(repoRoot, ["commit", "-m", "base"]);
  return repoRoot;
}

describe("frozen contract check", () => {
  it("accepts base-mode frozen spec changes when the commit range has an override", () => {
    const repoRoot = initRepo();

    try {
      const base = git(repoRoot, ["rev-parse", "HEAD"]);
      writeRepoFile(
        repoRoot,
        "spec/phase3/SPEC_TEST.md",
        ["---", "Status: CONTRACT_FROZEN", "---", "", "# Test", ""].join("\n"),
      );
      git(repoRoot, ["add", "."]);
      git(repoRoot, [
        "commit",
        "-m",
        "docs: freeze test spec [FREEZE-OVERRIDE]",
      ]);

      const result = spawnSync(
        process.execPath,
        ["--experimental-strip-types", scriptPath, "--base", base],
        { cwd: repoRoot, encoding: "utf8" },
      );

      expect(result.status).toBe(0);
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  });

  it("rejects base-mode frozen spec changes without an override", () => {
    const repoRoot = initRepo();

    try {
      const base = git(repoRoot, ["rev-parse", "HEAD"]);
      writeRepoFile(
        repoRoot,
        "spec/phase3/SPEC_TEST.md",
        ["---", "Status: CONTRACT_FROZEN", "---", "", "# Test", ""].join("\n"),
      );
      git(repoRoot, ["add", "."]);
      git(repoRoot, ["commit", "-m", "docs: freeze test spec"]);

      const result = spawnSync(
        process.execPath,
        ["--experimental-strip-types", scriptPath, "--base", base],
        { cwd: repoRoot, encoding: "utf8" },
      );

      expect(result.status).toBe(1);
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  });
});
