import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { compile } from "@cadenza-dev/core";
import { describe, expect, it } from "vitest";
import {
  createPhase4TechnicalTalkStarterFixtures,
  phase4TechnicalTalkStarters,
} from "../../../examples/phase4/technical-talk-starters.js";

type SkillEval = {
  expected_output: string;
  expectations: string[];
  files: string[];
  id: number;
  prompt: string;
};

type Phase4BoundaryArtifact = {
  path: string;
  text: string;
};

type Phase4BoundaryFinding = {
  label: string;
  path: string;
};

describe("B4.6 Phase 4 technical-talk starters", () => {
  it("TC-STAR-001 ships three narrow developer technical-talk starters on public Cadenza surfaces", () => {
    const source = readText("examples/phase4/technical-talk-starters.tsx");
    const fixtures = createPhase4TechnicalTalkStarterFixtures();

    expect(source).toContain('from "@cadenza-dev/core";');
    expect(source).not.toMatch(/from ["'](?:\.\.?\/|@remotion\/|remotion\b)/);
    expect(source).not.toContain("useCurrentFrame");
    expect(source).not.toContain("delayRender");
    expect(source).not.toContain("continueRender");
    expect(source).not.toContain("TransitionSeries");

    expect(phase4TechnicalTalkStarters.map((starter) => starter.kind)).toEqual([
      "architecture-talk",
      "data-explainer",
      "live-demo",
    ]);
    expect(fixtures.map((fixture) => fixture.kind)).toEqual(
      phase4TechnicalTalkStarters.map((starter) => starter.kind),
    );

    for (const starter of phase4TechnicalTalkStarters) {
      expect(starter.targetAudience).toContain("developers");
      expect(starter.scope).toBe("technical-talk");
      expect(starter.sourcePath).toBe(
        "examples/phase4/technical-talk-starters.tsx",
      );
      expect(starter.requiredSurfaces).toEqual(
        expect.arrayContaining([
          "public-cadenza-tsx",
          "render-safe-components",
          "speaker-notes",
          "presenter-metadata",
          "local-preview-repair",
        ]),
      );
      expect(starter.localPreviewRepairWorkflow).toEqual(
        expect.arrayContaining([
          "pnpm preview:phase4",
          "inspect presenter metadata and diagnostics",
          "repair the authored starter TSX",
        ]),
      );
      expect(starter.boundaryGuards).toEqual(
        expect.arrayContaining([
          "not a generic business prompt-to-deck template",
          "not a new starter package",
        ]),
      );
    }

    for (const fixture of fixtures) {
      const metadata = phase4TechnicalTalkStarters.find(
        (starter) => starter.kind === fixture.kind,
      );
      expect(metadata?.outline.map((entry) => entry.slideId)).toEqual(
        compile(fixture.deck).slides.map((slide) => slide.slideId),
      );
      expect(
        compile(fixture.deck).slides.flatMap((slide) => slide.notes).length,
      ).toBeGreaterThan(0);
      expect(metadata?.presenterMetadata).toEqual(
        expect.objectContaining({
          chapters: expect.arrayContaining([
            expect.objectContaining({ id: expect.any(String) }),
          ]),
          hasNotes: true,
          hasOutline: true,
        }),
      );
    }
  });

  it("TC-STAR-002 teaches Phase 4 product-layer workflows and evals reward technical-talk structure while penalizing boundary drift", () => {
    const skill = readText("skills/cadenza/SKILL.md");
    const productLayerRule = readText(
      "skills/cadenza/rules/product-layer-workflow.md",
    );
    const evals = readEvals();
    const positiveEval = evals.find((entry) =>
      entry.prompt.includes("Phase 4 technical-talk starters"),
    );
    const boundaryEval = evals.find((entry) =>
      entry.prompt.includes("WYSIWYG"),
    );

    expect(skill).toContain("Phase 4 Product-Layer Loop");
    expect(skill).toContain("technical-talk starters");
    expect(skill).toContain("examples/phase4/technical-talk-starters.tsx");
    expect(skill).toContain("rules/product-layer-workflow.md");

    for (const required of [
      "presenter workflow",
      "outline or chapters",
      "visual acceptance",
      "typography/density",
      "stronger transitions",
      "local preview repair",
    ]) {
      expect(productLayerRule).toContain(required);
    }

    expect(evals.length).toBeGreaterThanOrEqual(7);
    expect(positiveEval).toBeDefined();
    expect(positiveEval?.files).toEqual(
      expect.arrayContaining([
        "skills/cadenza/SKILL.md",
        "skills/cadenza/rules/product-layer-workflow.md",
        "examples/phase4/technical-talk-starters.tsx",
      ]),
    );
    expect(positiveEval?.expectations).toEqual(
      expect.arrayContaining([
        "The output uses architecture talk, data explainer, and live-demo starter surfaces for developers writing technical talks.",
        "The output uses public Cadenza TSX, render-safe components, Notes, presenter metadata, and local preview repair workflow.",
      ]),
    );

    expect(boundaryEval).toBeDefined();
    expect(boundaryEval?.expectations.join("\n")).toContain("WYSIWYG");
    expect(boundaryEval?.expectations.join("\n")).toContain(
      "template marketplace",
    );
    expect(boundaryEval?.expectations.join("\n")).toContain("MP4/PDF export");
    expect(boundaryEval?.expectations.join("\n")).toContain("hosted rendering");
    expect(boundaryEval?.expectations.join("\n")).toContain(
      "public API stability",
    );
    expect(boundaryEval?.expectations.join("\n")).toContain("external alpha");
  });

  it("TC-STAR-003 records read-only MCP as deferred evaluation and proves tool-based MCP remains absent", () => {
    const evidence = JSON.parse(
      readText("trace/phase4/evidence/b4.6-deferred-scope-guards.json"),
    ) as {
      batch: string;
      readOnlyMcp: {
        disposition: string;
        implemented: boolean;
      };
      scenarios: string[];
      toolBasedMcp: {
        checkedAbsentPaths: string[];
        prohibitedOperations: string[];
        status: string;
      };
    };
    const summary = readText(
      "trace/phase4/evidence/b4.6-deferred-scope-guards.md",
    );

    expect(evidence.batch).toBe("B4.6");
    expect(evidence.scenarios).toEqual(["TC-STAR-003"]);
    expect(evidence.readOnlyMcp).toEqual({
      disposition: "closeout-or-phase5-start-evaluation-only",
      implemented: false,
    });
    expect(evidence.toolBasedMcp.status).toBe("absent");
    expect(evidence.toolBasedMcp.prohibitedOperations).toEqual([
      "validate_deck",
      "render_preview",
      "inspect_composition",
    ]);
    expect(summary).toContain("Phase 5-start evaluation candidate");
    expect(summary.toLowerCase()).toContain("tool-based mcp remains absent");
    expect(readText("wip/future-support/phase-5-candidates.md")).toContain(
      "Read-only MCP resources and prompts evaluation",
    );

    for (const absentPath of evidence.toolBasedMcp.checkedAbsentPaths) {
      expect(existsSync(path.join(process.cwd(), absentPath))).toBe(false);
    }

    expect(
      findUnsupportedPhase4StarterClaims([
        {
          path: "draft.md",
          text: "Phase 4 starters ship a WYSIWYG editor, template marketplace, MP4/PDF export, hosted rendering, public API stability, external alpha usage, and tool-based MCP validate_deck.",
        },
      ]).map((finding) => finding.label),
    ).toEqual([
      "WYSIWYG editor",
      "template marketplace",
      "MP4/PDF export",
      "hosted rendering",
      "public API stability",
      "external alpha usage",
      "tool-based MCP",
      "validate_deck tool",
    ]);
    expect(
      findUnsupportedPhase4StarterClaims(readPhase4StarterArtifacts()),
    ).toEqual([]);
  });
});

function readEvals(): SkillEval[] {
  const data = JSON.parse(readText("skills/cadenza/evals/evals.json")) as {
    evals: SkillEval[];
  };
  return data.evals;
}

function readText(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function readPhase4StarterArtifacts(): Phase4BoundaryArtifact[] {
  return [
    "examples/phase4/technical-talk-starters.tsx",
    "skills/cadenza/SKILL.md",
    "skills/cadenza/rules/product-layer-workflow.md",
    "skills/cadenza/evals/evals.json",
    "trace/phase4/evidence/b4.6-deferred-scope-guards.md",
    "trace/phase4/evidence/b4.6-deferred-scope-guards.json",
  ].map((relativePath) => ({
    path: relativePath,
    text: readText(relativePath),
  }));
}

function findUnsupportedPhase4StarterClaims(
  artifacts: Phase4BoundaryArtifact[],
): Phase4BoundaryFinding[] {
  const prohibited = [
    {
      label: "WYSIWYG editor",
      pattern: /\bWYSIWYG\b/i,
    },
    {
      label: "template marketplace",
      pattern: /\btemplate marketplace\b/i,
    },
    {
      label: "MP4/PDF export",
      pattern: /\b(?:MP4\/PDF export|MP4 export|PDF export)\b/i,
    },
    {
      label: "hosted rendering",
      pattern: /\bhosted[- ]rendering\b/i,
    },
    {
      label: "Remotion Lambda",
      pattern: /\bRemotion Lambda\b/i,
    },
    {
      label: "public API stability",
      pattern: /\bpublic API\b[^.\n]*(?:stable|stability)\b/i,
    },
    {
      label: "external alpha usage",
      pattern: /\bexternal alpha\b|\balpha usage\b/i,
    },
    {
      label: "tool-based MCP",
      pattern: /\btool-based MCP\b/i,
    },
    {
      label: "validate_deck tool",
      pattern: /\bvalidate_deck\b/i,
    },
    {
      label: "render_preview tool",
      pattern: /\brender_preview\b/i,
    },
    {
      label: "inspect_composition tool",
      pattern: /\binspect_composition\b/i,
    },
  ];
  const findings: Phase4BoundaryFinding[] = [];

  for (const artifact of artifacts) {
    const lines = artifact.text.split(/\r?\n/);

    for (const [index, line] of lines.entries()) {
      if (isBoundaryContext(lines, index)) {
        continue;
      }

      for (const claim of prohibited) {
        if (claim.pattern.test(line)) {
          findings.push({ label: claim.label, path: artifact.path });
        }
      }
    }
  }

  return findings;
}

function isBoundaryContext(lines: string[], index: number): boolean {
  const normalized = lines
    .slice(Math.max(0, index - 3), index + 4)
    .join(" ")
    .toLowerCase();
  const markers = [
    "absence",
    "absent",
    "avoid",
    "boundary",
    "candidate",
    "claim",
    "defer",
    "deferred",
    "disposition",
    "do not",
    "evaluation item",
    "future",
    "keep",
    "may only",
    "must not",
    "no ",
    "not ",
    "out of scope",
    "penalize",
    "phase 5-start",
    "prohibited",
    "proposal",
    "reject",
    "remain",
    "review",
    "without",
  ];

  return markers.some((marker) => normalized.includes(marker));
}
