import { readFileSync } from "node:fs";
import path from "node:path";
import {
  type Phase4VisualAcceptanceEvidence,
  validatePhase4VisualAcceptanceEvidence,
} from "@cadenza-dev/core";
import { describe, expect, it } from "vitest";

const evidenceJsonPath = path.join(
  process.cwd(),
  "trace/phase4/evidence/b4.3-visual-acceptance-evidence.json",
);
const evidenceSummaryPath = path.join(
  process.cwd(),
  "trace/phase4/evidence/b4.3-visual-acceptance-evidence.md",
);

describe("B4.3 visual acceptance evidence and repair routing", () => {
  it("TC-VARR-001 records human visual findings as JSON plus maintainer summary", () => {
    const evidence = readPhase4VisualAcceptanceEvidence();
    const summary = readFileSync(evidenceSummaryPath, "utf8");
    const [finding] = evidence.findings;

    expect(evidence).toMatchObject({
      batchId: "B4.3",
      phase: "4",
      scenarioIds: ["TC-VARR-001", "TC-VARR-002", "TC-VARR-003"],
      schemaVersion: 1,
    });
    expect(finding).toMatchObject({
      affected: {
        chapterId: "product-layer",
        slideId: "product-layer-loop",
      },
      category: "diagnostics",
      id: "VARR-B4.3-001",
      intendedRepairSurface: "authored-deck",
      observedProblem: expect.stringContaining("visual acceptance"),
      requirementRefs: ["PRES-006", "VARR-001", "VARR-004", "VARR-005"],
      testRefs: ["TC-VARR-001"],
    });
    expect(finding?.commandsOrRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: "pnpm preview:phase4" }),
        expect.objectContaining({ value: "/" }),
      ]),
    );
    expect(finding?.before.diagnostics).toEqual([
      expect.objectContaining({
        code: "VARR_PREVIEW_SUMMARY_MISSING",
        source: "examples/phase4/dogfood-talk.tsx",
      }),
    ]);
    expect(finding?.after.diagnostics).toEqual([]);
    expect(finding?.before.evidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "preview-diagnostic",
          source: "examples/phase4/dogfood-talk.tsx",
        }),
      ]),
    );
    expect(finding?.after.evidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "authored-deck-repair",
          source: "examples/phase4/dogfood-talk.tsx",
        }),
        expect.objectContaining({
          kind: "presenter-workflow-diagnostic",
          source: "examples/phase4/preview.jsx",
        }),
      ]),
    );
    expect(evidence.productWorkflowDiagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "VARR_VISUAL_ACCEPTANCE_REPAIRED",
          source: "phase4-presenter-panel",
        }),
      ]),
    );
    expect(validatePhase4VisualAcceptanceEvidence(evidence)).toEqual([]);
    expect(summary).toContain("B4.3 visual acceptance evidence");
    expect(summary).toContain("TC-VARR-001");
    expect(summary).toContain("pnpm preview:phase4");
  });

  it("TC-VARR-002 keeps trace-only declarations and artifact-only proof insufficient", () => {
    const evidence = readPhase4VisualAcceptanceEvidence();
    const traceOnlyEvidence: Phase4VisualAcceptanceEvidence = {
      ...evidence,
      acceptanceEvidenceKind: "trace-declaration",
      traceDeclarationOnly: true,
    };
    const artifactOnlyEvidence: Phase4VisualAcceptanceEvidence = {
      ...evidence,
      acceptanceEvidenceKind: "screenshot-artifact-only",
      commands: [],
      productWorkflowDiagnostics: [],
    };

    expect(validatePhase4VisualAcceptanceEvidence(traceOnlyEvidence)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "VARR_TRACE_ONLY_DECLARATION",
          requirementId: "VARR-002",
          testRefs: ["TC-VARR-002"],
        }),
      ]),
    );
    expect(
      validatePhase4VisualAcceptanceEvidence(artifactOnlyEvidence),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "VARR_ARTIFACT_ONLY_ACCEPTANCE",
          requirementId: "VARR-006",
          testRefs: ["TC-VARR-002"],
        }),
      ]),
    );
    expect(evidence.optionalVisualArtifacts).toEqual([
      expect.objectContaining({
        kind: "pixel-sanity",
        required: false,
        source: "trace/phase4/evidence/b4.3-pixel-sanity-note.json",
      }),
    ]);
  });

  it("TC-VARR-003 repairs authored deck surfaces or routes framework defects separately", () => {
    const evidence = readPhase4VisualAcceptanceEvidence();
    const finding = firstFinding(evidence);
    const repairPaths = [
      ...finding.repairRouting.allowedEdits,
      ...finding.repairRouting.frameworkInternalEdits,
    ];
    const packageSourcePath = "packages/core/src/compiler/compile.ts";
    const packageRepairEvidence: Phase4VisualAcceptanceEvidence = {
      ...evidence,
      findings: [
        {
          ...finding,
          repairRouting: {
            ...finding.repairRouting,
            allowedEdits: [packageSourcePath],
            frameworkInternalEdits: [packageSourcePath],
            kind: "authored-deck-repair",
            separateBuilderIssue: null,
          },
        },
      ],
    };
    const frameworkDefectRouteEvidence: Phase4VisualAcceptanceEvidence = {
      ...evidence,
      findings: [
        {
          ...finding,
          intendedRepairSurface: "framework-defect-route",
          repairRouting: {
            allowedEdits: [],
            frameworkInternalEdits: [packageSourcePath],
            kind: "framework-defect-route",
            separateBuilderIssue:
              "trace/phase4/evidence/b4.3-framework-defect-route.md",
          },
        },
      ],
    };

    expect(repairPaths.some(isPackageSourcePath)).toBe(false);
    expect(readText("examples/phase4/dogfood-talk.tsx")).toContain(
      "visual acceptance evidence",
    );
    expect(readText("examples/phase4/preview.jsx")).toContain(
      "data-cadenza-phase4-visual-acceptance",
    );
    expect(
      validatePhase4VisualAcceptanceEvidence(packageRepairEvidence),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "VARR_PACKAGE_SRC_REPAIR_SCOPE",
          requirementId: "VARR-003",
          testRefs: ["TC-VARR-003"],
        }),
      ]),
    );
    expect(
      validatePhase4VisualAcceptanceEvidence(frameworkDefectRouteEvidence),
    ).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "VARR_PACKAGE_SRC_REPAIR_SCOPE",
        }),
      ]),
    );
  });
});

function readPhase4VisualAcceptanceEvidence(): Phase4VisualAcceptanceEvidence {
  return JSON.parse(readFileSync(evidenceJsonPath, "utf8"));
}

function firstFinding(
  evidence: Phase4VisualAcceptanceEvidence,
): Phase4VisualAcceptanceEvidence["findings"][number] {
  const finding = evidence.findings[0];
  if (!finding) {
    throw new Error("Expected at least one Phase 4 visual finding.");
  }

  return finding;
}

function readText(filePath: string): string {
  return readFileSync(path.join(process.cwd(), filePath), "utf8");
}

function isPackageSourcePath(repairPath: string): boolean {
  return /^packages\/[^/]+\/src\//.test(repairPath);
}
