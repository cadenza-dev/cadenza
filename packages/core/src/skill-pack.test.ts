import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REQUIRED_SKILLS = [
  "layout-composition",
  "motion-transitions",
  "speaker-notes",
  "render-debugging",
  "render-safe-components",
] as const;

describe("TC-SKIL-001 authoring skill pack", () => {
  it("ships the required Phase 1 authoring skills with typed API and render-safe guidance", () => {
    for (const skillName of REQUIRED_SKILLS) {
      const skillPath = path.join(
        process.cwd(),
        ".agents",
        "skills",
        skillName,
        "SKILL.md",
      );

      expect(existsSync(skillPath), `${skillName} skill is missing`).toBe(true);

      const content = readFileSync(skillPath, "utf8");
      expect(content).toContain("typed API");
      expect(content).toContain("render-safe");
      expect(content).toContain("raw Remotion primitives");
    }
  });
});

describe("TC-SKIL-004 skill repair workflow", () => {
  it("covers core authoring anti-patterns and a validate-and-repair loop", () => {
    const skillPackContent = REQUIRED_SKILLS.map((skillName) =>
      readSkill(skillName),
    ).join("\n");

    expect(skillPackContent).toContain("overflow");
    expect(skillPackContent).toContain("asset loading");
    expect(skillPackContent).toContain("timing");
    expect(skillPackContent).toContain("direct frame-coordinate manipulation");
    expect(skillPackContent).toContain("validate-and-repair");
    expect(skillPackContent).toContain("structured diagnostics");
  });
});

function readSkill(skillName: string): string {
  return readFileSync(skillPath(skillName), "utf8");
}

function skillPath(skillName: string): string {
  return path.join(process.cwd(), ".agents", "skills", skillName, "SKILL.md");
}
