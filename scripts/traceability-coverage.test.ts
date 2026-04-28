import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createTraceabilityCoverageReport } from "./traceability-coverage.js";

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
    const uncoveredBrowserNonGoal = ["BROW", "009"].join("-");
    expect(report.findings).toContain(
      `${uncoveredBrowserNonGoal} lacks current trace, test, or implementation evidence.`,
    );
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
  });
});
