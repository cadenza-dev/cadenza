import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  validatePhase3BoundaryClaims,
  validatePhase3DeferredScopeClaims,
  validateRawRemotionUsage,
} from "@cadenza-dev/core";
import { describe, expect, it } from "vitest";

describe("B3.4 AI boundaries and deferred-scope guards", () => {
  it("TC-AIBND-002 warns on raw Remotion primitives unless a short why reason is present", () => {
    const unreasonedDiagnostics = validateRawRemotionUsage(
      [
        'import { useCurrentFrame, delayRender } from "remotion";',
        "",
        "export function RawFrameReveal() {",
        "  const frame = useCurrentFrame();",
        "  return frame > 20 ? 'shown' : 'hidden';",
        "}",
      ].join("\n"),
      { source: "phase3/raw-frame-reveal.tsx" },
    );

    expect(unreasonedDiagnostics).toEqual([
      expect.objectContaining({
        code: "AIBND_RAW_REMOTION_ESCAPE_HATCH",
        message: expect.stringContaining("useCurrentFrame"),
        requirementId: "AIBND-002",
        severity: "warning",
        source: "phase3/raw-frame-reveal.tsx",
      }),
      expect.objectContaining({
        code: "AIBND_RAW_REMOTION_ESCAPE_HATCH",
        message: expect.stringContaining("delayRender"),
        requirementId: "AIBND-002",
        severity: "warning",
        source: "phase3/raw-frame-reveal.tsx",
      }),
    ]);

    expect(
      validateRawRemotionUsage(
        [
          'import { TransitionSeries } from "@remotion/transitions";',
          "// why: custom transition coverage before a typed Cadenza wrapper exists.",
          "export const CustomSequence = TransitionSeries;",
        ].join("\n"),
      ),
    ).toEqual([]);
  });

  it("TC-AIBND-001 rejects unsupported Phase 3 export, hosted, product, stability, and alpha claims", () => {
    expect(
      validatePhase3BoundaryClaims([
        {
          path: "trace/phase3/draft.md",
          text: "Phase 3 ships MP4 export, hosted rendering, public API stability, presenter product completeness, and external alpha usage.",
        },
      ]),
    ).toEqual([
      expect.objectContaining({
        code: "AIBND_UNSUPPORTED_PHASE3_CLAIM",
        message: expect.stringContaining("MP4 export"),
        requirementId: "AIBND-001",
        severity: "warning",
        source: "trace/phase3/draft.md",
      }),
      expect.objectContaining({
        message: expect.stringContaining("hosted rendering"),
      }),
      expect.objectContaining({
        message: expect.stringContaining("presenter product completeness"),
      }),
      expect.objectContaining({
        message: expect.stringContaining("public API stability"),
      }),
      expect.objectContaining({
        message: expect.stringContaining("external alpha usage"),
      }),
    ]);

    expect(validatePhase3BoundaryClaims(readPhase3BoundaryArtifacts())).toEqual(
      [],
    );
  });

  it("TC-AIBND-003 keeps wrapper command, complete deck IR, and MCP surfaces deferred", () => {
    expect(
      validatePhase3DeferredScopeClaims([
        {
          path: "trace/phase3/draft.md",
          text: "Phase 3 implements an authoring-loop wrapper command, a complete deck IR, read-only MCP resources, and tool-based MCP operations such as validate_deck.",
        },
      ]),
    ).toEqual([
      expect.objectContaining({
        code: "AIBND_DEFERRED_SCOPE_IMPLEMENTATION",
        message: expect.stringContaining("authoring-loop wrapper command"),
        requirementId: "AUTH-001",
        severity: "warning",
      }),
      expect.objectContaining({
        message: expect.stringContaining("complete deck IR"),
        requirementId: "DIAG-006",
      }),
      expect.objectContaining({
        message: expect.stringContaining("read-only MCP"),
        requirementId: "AIBND-004",
      }),
      expect.objectContaining({
        message: expect.stringContaining("tool-based MCP"),
        requirementId: "AIBND-006",
      }),
    ]);

    expect(
      validatePhase3DeferredScopeClaims(readPhase3DeferredScopeArtifacts()),
    ).toEqual([]);
    expect(
      readText("wip/future-support/conditional-or-later-candidates.md"),
    ).toContain("Authoring-loop orchestration command");
    expect(
      readText("wip/future-support/conditional-or-later-candidates.md"),
    ).toContain("Complete deck IR");
    expect(readText("wip/future-support/phase-4-candidates.md")).toContain(
      "Read-only MCP resources and prompts evaluation",
    );
    expect(readText("wip/future-support/phase-5-candidates.md")).toContain(
      "Tool-based MCP for stable local capabilities",
    );

    for (const deferredPath of [
      "packages/mcp",
      "packages/core/src/deck-ir.ts",
      "packages/core/src/complete-deck-ir.ts",
      "scripts/authoring-loop.ts",
      "scripts/cadenza-authoring-loop.ts",
    ]) {
      expect(existsSync(path.join(process.cwd(), deferredPath))).toBe(false);
    }
  });
});

function readPhase3BoundaryArtifacts(): Array<{ path: string; text: string }> {
  return [
    "prompt/PHASE3_KICK_BUILDER.md",
    "trace/phase3/status.yaml",
    "trace/phase3/tracker.md",
    "trace/phase3/evidence/b3.2-repair-evidence.md",
    "trace/phase3/evidence/b3.2-repair-evidence.json",
    "skills/cadenza/SKILL.md",
    "skills/cadenza/rules/browser-preview.md",
    "skills/cadenza/rules/data-explainers.md",
    "skills/cadenza/rules/motion-timing.md",
    "skills/cadenza/rules/render-safe-components.md",
    "skills/cadenza/rules/validation-repair.md",
    "skills/cadenza/examples/data-explainer.tsx",
    "skills/cadenza/evals/evals.json",
    "skills/cadenza-best-practices-workspace/iteration-2/benchmark.md",
    "skills/cadenza-best-practices-workspace/iteration-2/conclusions.md",
    "examples/phase3/acceptance-deck.tsx",
  ].map((relativePath) => ({
    path: relativePath,
    text: readFileSync(path.join(process.cwd(), relativePath), "utf8"),
  }));
}

function readPhase3DeferredScopeArtifacts(): Array<{
  path: string;
  text: string;
}> {
  return [
    ...readPhase3BoundaryArtifacts(),
    "wip/future-support/conditional-or-later-candidates.md",
    "wip/future-support/phase-4-candidates.md",
    "wip/future-support/phase-5-candidates.md",
  ].map((artifact) =>
    typeof artifact === "string"
      ? { path: artifact, text: readText(artifact) }
      : artifact,
  );
}

function readText(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}
