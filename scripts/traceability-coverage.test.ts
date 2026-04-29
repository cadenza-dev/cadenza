import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  createTraceabilityCoverageReport,
  formatTraceabilityCoverageMarkdown,
} from "./traceability-coverage.js";

describe("TC-TRAC-001 traceability coverage report", () => {
  it("compares Phase 2 requirements across specs, trace matrices, tests, and implementation evidence without mutating frozen Phase 1 specs", () => {
    const phase1MatrixBefore = readFileSync(
      "spec/phase1/SPEC_TEST_MATRIX.md",
      "utf8",
    );

    const report = createTraceabilityCoverageReport({
      phase: "2",
      repoRoot: process.cwd(),
    });

    const trac001 = report.requirements.find(
      (requirement) => requirement.id === "TRAC-001",
    );

    expect(trac001).toMatchObject({
      inSpec: true,
      matrixTestIds: ["TC-TRAC-001"],
      traceabilityTestIds: ["TC-TRAC-001"],
    });
    expect(trac001?.testEvidenceFiles).toContain(
      "scripts/traceability-coverage.test.ts",
    );
    expect(trac001?.implementationEvidenceFiles).toContain(
      "scripts/traceability-coverage.ts",
    );
    expect(report.sources.specFiles).toContain(
      "spec/phase2/SPEC_TRACEABILITY_COVERAGE.md",
    );
    expect(report.sources.testFiles).not.toContainEqual(
      expect.stringContaining("\\"),
    );
    expect(report.nonGoals).toEqual([
      {
        acceptanceScenarioPresent: false,
        claim: "MP4 export",
      },
      {
        acceptanceScenarioPresent: false,
        claim: "PDF export",
      },
      {
        acceptanceScenarioPresent: false,
        claim: "hosted rendering",
      },
    ]);
    expect(readFileSync("spec/phase1/SPEC_TEST_MATRIX.md", "utf8")).toBe(
      phase1MatrixBefore,
    );
    const closeoutRequirementIds = [
      ["BROW", "007"].join("-"),
      ["BROW", "009"].join("-"),
      ["PKG", "004"].join("-"),
      ["PKG", "006"].join("-"),
      ["PRAD", "007"].join("-"),
      ["PRAD", "008"].join("-"),
      ["RSRM", "009"].join("-"),
    ];

    for (const requirementId of closeoutRequirementIds) {
      const coverage = report.requirements.find(
        (requirement) => requirement.id === requirementId,
      );

      expect(coverage?.traceStatusEvidenceFiles.length).toBeGreaterThan(0);
    }
    expect(report.findings).toEqual([]);
  });
});

describe("coverage evidence classification", () => {
  it("does not let trace-only declarations satisfy acceptance evidence", () => {
    const repoRoot = mkdtempSync(path.join(tmpdir(), "cadenza-trace-only-"));

    try {
      writeFileSync(path.join(repoRoot, "STATUS.yaml"), 'current_phase: "2"\n');
      mkdirSync(path.join(repoRoot, "spec/phase2"), { recursive: true });
      mkdirSync(path.join(repoRoot, "trace/phase2"), { recursive: true });
      writeFileSync(
        path.join(repoRoot, "spec/phase2/SPEC_PREVIEW_ADAPTER.md"),
        [
          "# Preview Adapter",
          "",
          "- **ID**: PRAD-999",
          "- **Priority**: P1",
          "- **Owner**: Architect -> Builder",
          "- **Statement**: Diagnostics must be proven outside trace text.",
          "- **Verification**: Test or implementation evidence proves it.",
          "",
        ].join("\n"),
      );
      writeFileSync(
        path.join(repoRoot, "spec/phase2/SPEC_TEST_MATRIX.md"),
        [
          "# Test Matrix",
          "",
          "| Test ID | Priority | Requirement IDs | Scenario |",
          "| :--- | :--- | :--- | :--- |",
          "| TC-PRAD-999 | P1 | PRAD-999 | Trace-only regression fixture. |",
          "",
        ].join("\n"),
      );
      writeFileSync(
        path.join(repoRoot, "spec/phase2/SPEC_TRACEABILITY.md"),
        [
          "# Traceability",
          "",
          "| Requirement ID | Test IDs | Future code location |",
          "| :--- | :--- | :--- |",
          "| PRAD-999 | TC-PRAD-999 | `packages/preview-remotion/src/diagnostics.ts` |",
          "",
        ].join("\n"),
      );
      writeFileSync(
        path.join(repoRoot, "trace/phase2/status.yaml"),
        [
          "builder_progress:",
          "  completed_batches:",
          "    - id: trace-only",
          "      requirements: [PRAD-999]",
          "      evidence:",
          "        trace:",
          "          - trace/phase2/status.yaml",
          "",
        ].join("\n"),
      );

      const report = createTraceabilityCoverageReport({
        phase: "2",
        repoRoot,
      });

      expect(report.findings).toContain(
        "PRAD-999 lacks acceptance evidence or maintainer-approved waiver.",
      );
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  });

  it("does not treat an existing future implementation path as proof unless it names the requirement or scenario", () => {
    const repoRoot = mkdtempSync(path.join(tmpdir(), "cadenza-future-path-"));

    try {
      writeFileSync(path.join(repoRoot, "STATUS.yaml"), 'current_phase: "2"\n');
      mkdirSync(path.join(repoRoot, "spec/phase2"), { recursive: true });
      mkdirSync(path.join(repoRoot, "trace/phase2"), { recursive: true });
      mkdirSync(path.join(repoRoot, "packages/preview-remotion/src"), {
        recursive: true,
      });
      writeFileSync(
        path.join(repoRoot, "packages/preview-remotion/src/diagnostics.ts"),
        "export const unrelated = true;\n",
      );
      writeFileSync(
        path.join(repoRoot, "spec/phase2/SPEC_PREVIEW_ADAPTER.md"),
        [
          "# Preview Adapter",
          "",
          "- **ID**: PRAD-998",
          "- **Priority**: P1",
          "- **Owner**: Architect -> Builder",
          "- **Statement**: Existing future paths are not proof.",
          "- **Verification**: Requirement-linked evidence proves it.",
          "",
        ].join("\n"),
      );
      writeFileSync(
        path.join(repoRoot, "spec/phase2/SPEC_TEST_MATRIX.md"),
        [
          "# Test Matrix",
          "",
          "| Test ID | Priority | Requirement IDs | Scenario |",
          "| :--- | :--- | :--- | :--- |",
          "| TC-PRAD-998 | P1 | PRAD-998 | Existing path regression fixture. |",
          "",
        ].join("\n"),
      );
      writeFileSync(
        path.join(repoRoot, "spec/phase2/SPEC_TRACEABILITY.md"),
        [
          "# Traceability",
          "",
          "| Requirement ID | Test IDs | Future code location |",
          "| :--- | :--- | :--- |",
          "| PRAD-998 | TC-PRAD-998 | `packages/preview-remotion/src/diagnostics.ts` |",
          "",
        ].join("\n"),
      );
      writeFileSync(
        path.join(repoRoot, "trace/phase2/status.yaml"),
        "builder_progress:\n  completed_batches: []\n",
      );

      const report = createTraceabilityCoverageReport({
        phase: "2",
        repoRoot,
      });

      expect(report.findings).toContain(
        "PRAD-998 lacks acceptance evidence or maintainer-approved waiver.",
      );
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  });
});

describe("TC-RSRM-009 render-time compatibility boundary", () => {
  it("keeps render-safe preview compatibility from becoming export acceptance evidence", () => {
    const report = createTraceabilityCoverageReport({
      phase: "2",
      repoRoot: process.cwd(),
    });

    const rsrm009 = report.requirements.find(
      (requirement) => requirement.id === "RSRM-009",
    );
    const brow009 = report.requirements.find(
      (requirement) => requirement.id === "BROW-009",
    );

    expect(rsrm009?.matrixTestIds).toContain("TC-RSRM-009");
    expect(brow009?.matrixTestIds).toContain("TC-RSRM-009");
    expect(report.nonGoals).toEqual([
      {
        acceptanceScenarioPresent: false,
        claim: "MP4 export",
      },
      {
        acceptanceScenarioPresent: false,
        claim: "PDF export",
      },
      {
        acceptanceScenarioPresent: false,
        claim: "hosted rendering",
      },
    ]);
  });
});

describe("TC-TRAC-005 trace scope evidence", () => {
  it("records Stage A/B decisions and keeps deferred governance work separate from Phase 2 acceptance evidence", () => {
    const report = createTraceabilityCoverageReport({
      phase: "2",
      repoRoot: process.cwd(),
    });

    expect(report.traceScope.stageAStatus).toBe("complete");
    expect(report.traceScope.stageBStatus).toBe("complete");
    expect(report.traceScope.statusEvidencePathsMissing).toEqual([]);
    expect(report.traceScope.deferredItems).toEqual(
      expect.arrayContaining([
        {
          file: "TODO.md",
          marker: "active-phase-only hard gate",
        },
        {
          file: "wip/architect/phase1-traceability-coverage.md",
          marker: "Promoted into Phase 2 draft contract",
        },
      ]),
    );
    expect(report.revP1004Disposition).toMatchObject({
      currentDisposition: "mitigated_by_phase2_non_mutating_report",
      deferredFollowUp: "active-phase-only hard gate",
      frozenPhase1SpecsEdited: false,
      sourceFinding: "trace/phase1/review-phase1-closeout.md",
    });

    const markdown = formatTraceabilityCoverageMarkdown(report);

    expect(markdown).toContain("## REV-P1-004 Disposition");
    expect(markdown).toContain("REV-P1-004");
    expect(markdown).toContain("active-phase-only hard gate");
  });
});
