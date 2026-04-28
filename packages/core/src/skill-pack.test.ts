import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  readlinkSync,
} from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MONO_SKILL_NAME = "cadenza-best-practices";
const REMOVED_AUTHORING_SKILLS = [
  "layout-composition",
  "motion-transitions",
  "speaker-notes",
  "render-debugging",
  "render-safe-components",
] as const;

describe("TC-SKIL-001 authoring skill pack", () => {
  it("ships the cadenza-best-practices mono-skill with generated agent mirrors", () => {
    expect(existsSync(monoSkillPath("SKILL.md"))).toBe(true);

    const agentMirror = path.join(
      process.cwd(),
      ".agents",
      "skills",
      MONO_SKILL_NAME,
    );
    const claudeMirror = path.join(
      process.cwd(),
      ".claude",
      "skills",
      MONO_SKILL_NAME,
    );

    expect(lstatSync(agentMirror).isSymbolicLink()).toBe(true);
    expect(readlinkSync(agentMirror).replaceAll("\\", "/")).toBe(
      "../../skills/cadenza",
    );
    expect(lstatSync(claudeMirror).isSymbolicLink()).toBe(true);
    expect(readlinkSync(claudeMirror).replaceAll("\\", "/")).toBe(
      `../../.agents/skills/${MONO_SKILL_NAME}`,
    );

    const content = readMonoSkill();
    expect(content).toContain("typed TSX API");
    expect(content).toContain("render-safe");
    expect(content).toContain("raw Remotion primitives");

    for (const skillName of REMOVED_AUTHORING_SKILLS) {
      expect(
        existsSync(path.join(process.cwd(), ".agents", "skills", skillName)),
      ).toBe(false);
    }
  });
});

describe("TC-SKIL-004 skill repair workflow", () => {
  it("covers core authoring anti-patterns and a validate-and-repair loop", () => {
    const skillPackContent = readMonoSkill();

    expect(skillPackContent).toContain("overflow");
    expect(skillPackContent).toContain("asset loading");
    expect(skillPackContent).toContain("timing");
    expect(skillPackContent).toContain("direct frame-coordinate manipulation");
    expect(skillPackContent).toContain("validate-and-repair");
    expect(skillPackContent).toContain("structured diagnostics");
  });
});

describe("TC-VAL-006 validation report guidance", () => {
  it("points repair workflows at the machine-readable validation report", () => {
    const skillPackContent = readMonoSkill();

    expect(skillPackContent).toContain("createValidationReport");
    expect(skillPackContent).toContain("repairQueue");
  });
});

function readMonoSkill(): string {
  return readMarkdownFiles(path.join(process.cwd(), "skills", "cadenza")).join(
    "\n",
  );
}

function monoSkillPath(file: string): string {
  return path.join(process.cwd(), "skills", "cadenza", file);
}

function readMarkdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return readMarkdownFiles(child);
    }
    return child.endsWith(".md") ? [readFileSync(child, "utf8")] : [];
  });
}
