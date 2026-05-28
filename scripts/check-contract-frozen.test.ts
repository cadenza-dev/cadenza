import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const scriptPath = path.resolve("scripts/check-contract-frozen.ts");
const LOCAL_GIT_ENV_KEYS = [
  "GIT_ALTERNATE_OBJECT_DIRECTORIES",
  "GIT_COMMON_DIR",
  "GIT_DIR",
  "GIT_INDEX_FILE",
  "GIT_OBJECT_DIRECTORY",
  "GIT_PREFIX",
  "GIT_WORK_TREE",
];

function isolatedGitEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  for (const key of LOCAL_GIT_ENV_KEYS) {
    delete env[key];
  }
  return env;
}

function git(repoRoot: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: repoRoot,
    env: isolatedGitEnv(),
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
  it("keeps temporary fixture repos isolated from inherited hook Git environment", () => {
    const outerRepoRoot = initRepo();

    try {
      const outerGitDir = path.join(outerRepoRoot, ".git");
      const outerHead = git(outerRepoRoot, ["rev-parse", "HEAD"]);
      const previousGitDir = process.env.GIT_DIR;
      const previousGitWorkTree = process.env.GIT_WORK_TREE;
      process.env.GIT_DIR = outerGitDir;
      process.env.GIT_WORK_TREE = outerRepoRoot;

      try {
        const fixtureRepoRoot = initRepo();

        try {
          expect(existsSync(path.join(fixtureRepoRoot, ".git"))).toBe(true);
          expect(git(outerRepoRoot, ["rev-parse", "HEAD"])).toBe(outerHead);
        } finally {
          rmSync(fixtureRepoRoot, { force: true, recursive: true });
        }
      } finally {
        if (previousGitDir === undefined) {
          delete process.env.GIT_DIR;
        } else {
          process.env.GIT_DIR = previousGitDir;
        }
        if (previousGitWorkTree === undefined) {
          delete process.env.GIT_WORK_TREE;
        } else {
          process.env.GIT_WORK_TREE = previousGitWorkTree;
        }
      }
    } finally {
      rmSync(outerRepoRoot, { force: true, recursive: true });
    }
  });

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
        { cwd: repoRoot, encoding: "utf8", env: isolatedGitEnv() },
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
        { cwd: repoRoot, encoding: "utf8", env: isolatedGitEnv() },
      );

      expect(result.status).toBe(1);
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  });
});
