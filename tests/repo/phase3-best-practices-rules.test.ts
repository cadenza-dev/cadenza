import { existsSync, lstatSync, readFileSync, readlinkSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type SkillEval = {
  id: number;
  prompt: string;
  expected_output: string;
  files: string[];
  expectations: string[];
};

describe("B3.3 cadenza-best-practices rule and eval strengthening", () => {
  it("TC-RULE-001 teaches the local authoring loop and keeps generated mirrors consistent", () => {
    expectMirror(
      ".agents/skills/cadenza-best-practices",
      "../../skills/cadenza",
    );
    expectMirror(
      ".claude/skills/cadenza-best-practices",
      "../../.agents/skills/cadenza-best-practices",
    );

    const skill = readText("skills/cadenza/SKILL.md");
    const validationRepair = readText(
      "skills/cadenza/rules/validation-repair.md",
    );
    const browserPreview = readText("skills/cadenza/rules/browser-preview.md");
    const normalizedSkill = skill.toLowerCase();

    expect(skill).toContain("Local Authoring Loop");
    expect(normalizedSkill).toContain("author typed tsx");
    expect(normalizedSkill).toContain("compile");
    expect(normalizedSkill).toContain("preview");
    expect(normalizedSkill).toContain("inspect diagnostics");
    expect(normalizedSkill).toContain("repair the authored deck");
    expect(normalizedSkill).toContain("re-run checks");
    expect(normalizedSkill).toContain("without editing framework internals");
    expect(skill).toContain("rules/data-explainers.md");
    expect(validationRepair).toContain("fatal authoring errors first");
    expect(validationRepair).toContain("one focused repair");
    expect(browserPreview).toContain("shared diagnostic channel");
  });

  it("TC-RULE-002 keeps data-explainer guidance and examples inside the mono-skill public surface", () => {
    expect(
      existsSync(repoPath("skills/cadenza/rules/data-explainers.md")),
    ).toBe(true);
    expect(existsSync(repoPath(".agents/skills/data-viz-slides"))).toBe(false);
    expect(existsSync(repoPath("packages/data-viz"))).toBe(false);

    const rule = readText("skills/cadenza/rules/data-explainers.md");
    const example = readText("skills/cadenza/examples/data-explainer.tsx");
    const tsconfig = JSON.parse(readText("tsconfig.json"));

    expect(tsconfig.include).toContain("skills/cadenza/examples/**/*.tsx");
    expect(rule).toContain("chart/story framing");
    expect(rule).toContain("bounded labels");
    expect(rule).toContain("render-safe composition");
    expect(rule).toContain("Notes");
    expect(rule).toContain("does not create");

    for (const cue of [
      '@cadenza-dev/core"',
      "Deck",
      "Slide",
      "Step",
      "Transition",
      "Notes",
      "Theme",
      "ContentSlot",
      "TypographyBox",
      "MediaFrame",
    ]) {
      expect(example).toContain(cue);
    }

    expect(example).not.toContain('from "remotion"');
    expect(example).not.toContain("useCurrentFrame");
    expect(example).not.toContain("d3");
  });

  it("TC-RULE-003 adds evals and curated evidence for diagnostics-driven repair and boundary penalties", () => {
    const evals = readEvals();
    const phase3Eval = evals.find((entry) => entry.id === 5);

    expect(evals.length).toBeGreaterThanOrEqual(5);
    expect(phase3Eval).toBeDefined();
    expect(phase3Eval?.prompt).toContain("repairQueue");
    expect(phase3Eval?.prompt).toContain("raw Remotion drift");
    expect(phase3Eval?.prompt).toContain("framework internal edits");
    expect(phase3Eval?.prompt).toContain("export claims");
    expect(phase3Eval?.prompt).toContain("Phase 4");
    expect(phase3Eval?.files).toContain(
      "skills/cadenza/rules/data-explainers.md",
    );
    expect(phase3Eval?.expectations).toContain(
      "The output applies diagnostics-driven repair before visual restyling.",
    );
    expect(phase3Eval?.expectations).toContain(
      "The output penalizes raw Remotion drift unless there is a short // why: reason.",
    );

    const benchmark = readText(
      "skills/cadenza-best-practices-workspace/iteration-2/benchmark.md",
    );
    const conclusions = readText(
      "skills/cadenza-best-practices-workspace/iteration-2/conclusions.md",
    );

    expect(benchmark).toContain("with_skill");
    expect(benchmark).toContain("without_skill");
    expect(benchmark).toContain("data-explainer");
    expect(benchmark).toContain("diagnostics-driven repair");
    expect(conclusions).toContain("rules/data-explainers.md");
    expect(conclusions).toContain("RULE-006 rationale");
    expect(conclusions).toContain("single mono-skill rule file");
  });
});

function readEvals(): SkillEval[] {
  const data = JSON.parse(readText("skills/cadenza/evals/evals.json")) as {
    evals: SkillEval[];
  };
  return data.evals;
}

function expectMirror(relativePath: string, target: string) {
  const mirror = repoPath(relativePath);

  expect(lstatSync(mirror).isSymbolicLink()).toBe(true);
  expect(readlinkSync(mirror).replaceAll("\\", "/")).toBe(target);
}

function readText(relativePath: string): string {
  return readFileSync(repoPath(relativePath), "utf8");
}

function repoPath(relativePath: string): string {
  return path.join(process.cwd(), relativePath);
}
