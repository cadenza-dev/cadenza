import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  readlinkSync,
} from "node:fs";
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

function requireScriptReference(configFile: string) {
  if (!existsSync(repoPath(configFile))) {
    findings.push({ level: "error", message: `missing ${configFile}` });
    return;
  }

  const text = readText(configFile);
  const matches = new Set(
    text.match(/scripts\/hooks\/[A-Za-z0-9_.-]+\.sh/g) ?? [],
  );

  if (matches.size === 0) {
    findings.push({
      level: "error",
      message: `${configFile} does not reference any scripts/hooks/*.sh files`,
    });
    return;
  }

  for (const script of matches) {
    requirePath(script);
  }
}

function requirePackageScript(name: string) {
  const packageJson = JSON.parse(readText("package.json"));
  if (!packageJson.scripts?.[name]) {
    findings.push({
      level: "error",
      message: `package.json missing script ${name}`,
    });
  }
}

function cadenzaSkillNames(): string[] {
  const skillsDir = repoPath(".agents/skills");
  if (!existsSync(skillsDir)) {
    findings.push({ level: "error", message: "missing .agents/skills" });
    return [];
  }

  return readdirSync(skillsDir)
    .filter((name) => name.startsWith("cadenza-"))
    .filter((name) => existsSync(repoPath(`.agents/skills/${name}`)))
    .sort();
}

function checkSkillMirror() {
  const names = cadenzaSkillNames();
  if (names.length === 0) {
    findings.push({
      level: "error",
      message: "no .agents/skills/cadenza-* skills found",
    });
    return;
  }

  for (const name of names) {
    requirePath(`.agents/skills/${name}/SKILL.md`);

    const mirror = `.claude/skills/${name}`;
    const mirrorPath = repoPath(mirror);
    if (!existsSync(mirrorPath)) {
      findings.push({ level: "error", message: `missing ${mirror}` });
      continue;
    }

    const stats = lstatSync(mirrorPath);
    if (!stats.isSymbolicLink()) {
      findings.push({ level: "error", message: `${mirror} is not a symlink` });
      continue;
    }

    const target = readlinkSync(mirrorPath).replaceAll("\\", "/");
    const expected = `../../.agents/skills/${name}`;
    if (target !== expected) {
      findings.push({
        level: "error",
        message: `${mirror} points to ${target}, expected ${expected}`,
      });
    }
  }
}

for (const file of [
  "AGENTS.md",
  "STATUS.yaml",
  ".claude/settings.json",
  ".codex/hooks.json",
  "scripts/hooks/README.md",
  "scripts/commands-sync.sh",
]) {
  requirePath(file);
}

for (const script of [
  "check:harness",
  "check:memory",
  "check:role-boundary",
  "phase:check",
]) {
  requirePackageScript(script);
}

requireScriptReference(".claude/settings.json");
requireScriptReference(".codex/hooks.json");
checkSkillMirror();

const errorCount = findings.filter(
  (finding) => finding.level === "error",
).length;
for (const finding of findings) {
  console.log(`${finding.level}: ${finding.message}`);
}

if (errorCount > 0) {
  console.log(`check:harness failed (${errorCount} error(s))`);
  process.exit(1);
}

console.log("check:harness OK");
