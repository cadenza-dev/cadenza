import { spawnSync } from "node:child_process";
import {
  existsSync,
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

function writeRepoFile(repoRoot: string, file: string, text: string) {
  mkdirSync(path.dirname(path.join(repoRoot, file)), { recursive: true });
  writeFileSync(path.join(repoRoot, file), text);
}

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

describe("Phase 4 closeout traceability coverage", () => {
  it("does not require Phase 2 traceability-governance requirements for Phase 4", () => {
    const report = createTraceabilityCoverageReport({
      phase: "4",
      repoRoot: process.cwd(),
    });

    expect(
      report.findings.filter((finding) => finding.includes("TRAC-")),
    ).toEqual([]);
  });

  it("fails closeout coverage when Phase 4 visual sign-off or waiver is still pending", () => {
    const pendingRepoRoot = createPhase4VisualDecisionFixture(
      "pending-closeout-signoff",
    );
    const signedOffRepoRoot = createPhase4VisualDecisionFixture("signed-off");
    const pendingFinding =
      "Phase 4 visual closeout is pending maintainer sign-off or explicit waiver.";

    try {
      expect(
        createTraceabilityCoverageReport({
          phase: "4",
          repoRoot: pendingRepoRoot,
        }).findings,
      ).toContain(pendingFinding);
      expect(
        createTraceabilityCoverageReport({
          phase: "4",
          repoRoot: signedOffRepoRoot,
        }).findings,
      ).not.toContain(pendingFinding);
    } finally {
      rmSync(pendingRepoRoot, { force: true, recursive: true });
      rmSync(signedOffRepoRoot, { force: true, recursive: true });
    }
  });
});

function createPhase4VisualDecisionFixture(
  maintainerVisualDecision:
    | "explicit-waiver"
    | "pending-closeout-signoff"
    | "signed-off",
): string {
  const repoRoot = mkdtempSync(path.join(tmpdir(), "cadenza-phase4-visual-"));

  writeRepoFile(repoRoot, "STATUS.yaml", 'current_phase: "4"\n');
  writeRepoFile(
    repoRoot,
    "spec/phase4/SPEC_VISUAL_ACCEPTANCE_REPAIR.md",
    [
      "# Visual Acceptance",
      "",
      "- **ID**: VARR-002",
      "- **Priority**: P0",
      "- **Owner**: Architect -> Builder",
      "- **Statement**: Visual acceptance evidence MUST distinguish real proof from trace-only declarations.",
      "- **Verification**: acceptance scenario `TC-VARR-002` checks closeout proof.",
      "",
    ].join("\n"),
  );
  writeRepoFile(
    repoRoot,
    "spec/phase4/SPEC_TEST_MATRIX.md",
    [
      "# Test Matrix",
      "",
      "| Test ID | Priority | Requirement IDs | Scenario |",
      "| :--- | :--- | :--- | :--- |",
      "| TC-VARR-002 | P0 | VARR-002 | Trace-only visual acceptance remains insufficient. |",
      "",
    ].join("\n"),
  );
  writeRepoFile(
    repoRoot,
    "spec/phase4/SPEC_TRACEABILITY.md",
    [
      "# Traceability",
      "",
      "| Requirement ID | Test IDs | Future code location |",
      "| :--- | :--- | :--- |",
      "| VARR-002 | TC-VARR-002 | `trace/phase4/evidence/b4.3-visual-acceptance-evidence.json` |",
      "",
    ].join("\n"),
  );
  writeRepoFile(
    repoRoot,
    "trace/phase4/status.yaml",
    [
      'phase: "4"',
      "status: builder_ready",
      "exit_criteria:",
      "  builder_batches_complete:",
      "    status: met",
      "builder_progress:",
      "  completed_batches:",
      "    - id: B4.3",
      "      requirements: [VARR-002]",
      "      evidence:",
      "        trace_evidence:",
      "          - trace/phase4/evidence/b4.3-visual-acceptance-evidence.json",
      "",
    ].join("\n"),
  );
  writeRepoFile(
    repoRoot,
    "trace/phase4/evidence/b4.3-visual-acceptance-evidence.json",
    JSON.stringify(
      {
        batchId: "B4.3",
        maintainerVisualDecision,
        phase: "4",
        schemaVersion: 1,
      },
      null,
      2,
    ),
  );

  return repoRoot;
}

describe("coverage evidence classification", () => {
  it("supports a non-mutating check mode that fails on active-phase coverage findings", () => {
    const repoRoot = mkdtempSync(path.join(tmpdir(), "cadenza-check-mode-"));

    try {
      writeRepoFile(repoRoot, "STATUS.yaml", 'current_phase: "2"\n');
      writeRepoFile(
        repoRoot,
        "spec/phase2/SPEC_PREVIEW_ADAPTER.md",
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
      writeRepoFile(
        repoRoot,
        "spec/phase2/SPEC_TEST_MATRIX.md",
        [
          "# Test Matrix",
          "",
          "| Test ID | Priority | Requirement IDs | Scenario |",
          "| :--- | :--- | :--- | :--- |",
          "| TC-PRAD-999 | P1 | PRAD-999 | Check-mode regression fixture. |",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "spec/phase2/SPEC_TRACEABILITY.md",
        [
          "# Traceability",
          "",
          "| Requirement ID | Test IDs | Future code location |",
          "| :--- | :--- | :--- |",
          "| PRAD-999 | TC-PRAD-999 | `packages/preview-remotion/src/diagnostics.ts` |",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "trace/phase2/status.yaml",
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

      expect(
        createTraceabilityCoverageReport({ phase: "2", repoRoot }).findings,
      ).toContain(
        "PRAD-999 lacks acceptance evidence or maintainer-approved waiver.",
      );

      const result = spawnSync(
        process.execPath,
        [
          "--experimental-strip-types",
          path.resolve("scripts/traceability-coverage.ts"),
          "--phase",
          "2",
          "--check",
        ],
        { cwd: repoRoot, encoding: "utf8" },
      );

      expect(result.status).toBe(1);
      expect(
        existsSync(
          path.join(repoRoot, "trace/phase2/traceability-coverage.md"),
        ),
      ).toBe(false);
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  }, 20_000);

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

describe("phase:check active-phase coverage gate", () => {
  it("fails Phase 2 closeout when the active phase has coverage findings", () => {
    const repoRoot = mkdtempSync(path.join(tmpdir(), "cadenza-phase-check-"));

    try {
      writeRepoFile(
        repoRoot,
        "STATUS.yaml",
        ['current_phase: "2"', ""].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "package.json",
        JSON.stringify(
          {
            scripts: {
              "format:check": "biome format .",
              lint: "biome check .",
              "phase:check":
                "node --experimental-strip-types scripts/phase-check.ts",
              "spec:lint":
                "node --experimental-strip-types scripts/lint-specs.ts",
              test: "vitest run --passWithNoTests",
              typecheck: "tsc --noEmit",
            },
          },
          null,
          2,
        ),
      );
      for (const file of [
        "prompt/PHASE0_KICK_BUILDER.md",
        "prompt/PHASE1_KICK_BUILDER.md",
        "prompt/PHASE2_KICK_ARCHITECT.md",
        "prompt/PHASE2_KICK_BUILDER.md",
        "prompt/PHASE3_KICK_ARCHITECT.md",
        "pnpm-workspace.yaml",
        "biome.jsonc",
        "tsconfig.json",
        "scripts/lint-specs.ts",
        "scripts/phase-check.ts",
        ".githooks/pre-commit",
        ".githooks/commit-msg",
        ".github/workflows/ci.yml",
        "trace/phase1/review-phase1-closeout.md",
        "trace/phase2/tracker.md",
      ]) {
        writeRepoFile(repoRoot, file, "# placeholder\n");
      }
      writeRepoFile(
        repoRoot,
        "trace/phase1/status.yaml",
        [
          'phase: "1"',
          "status: complete",
          "exit_criteria:",
          "  phase_pointer_advanced_after_maintainer_approval:",
          "    status: met",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "trace/phase2/status.yaml",
        [
          'phase: "2"',
          "status: builder_ready",
          "exit_criteria:",
          "  builder_batches_complete:",
          "    status: pending",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "spec/phase1/SPEC_TEST_MATRIX.md",
        [
          "---",
          "Status: CONTRACT_FROZEN",
          "---",
          "",
          "# Phase 1 Test Matrix",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "spec/phase2/SPEC_PREVIEW_ADAPTER.md",
        [
          "---",
          "Status: CONTRACT_FROZEN",
          "---",
          "",
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
      writeRepoFile(
        repoRoot,
        "spec/phase2/SPEC_TEST_MATRIX.md",
        [
          "---",
          "Status: CONTRACT_FROZEN",
          "---",
          "",
          "# Test Matrix",
          "",
          "| Test ID | Priority | Requirement IDs | Scenario |",
          "| :--- | :--- | :--- | :--- |",
          "| TC-PRAD-999 | P1 | PRAD-999 | Phase-check regression fixture. |",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "spec/phase2/SPEC_TRACEABILITY.md",
        [
          "---",
          "Status: CONTRACT_FROZEN",
          "---",
          "",
          "# Traceability",
          "",
          "| Requirement ID | Test IDs | Future code location |",
          "| :--- | :--- | :--- |",
          "| PRAD-999 | TC-PRAD-999 | `packages/preview-remotion/src/diagnostics.ts` |",
          "",
        ].join("\n"),
      );

      expect(
        createTraceabilityCoverageReport({ phase: "2", repoRoot }).findings,
      ).toContain(
        "PRAD-999 lacks acceptance evidence or maintainer-approved waiver.",
      );

      const pendingResult = spawnSync(
        process.execPath,
        ["--experimental-strip-types", path.resolve("scripts/phase-check.ts")],
        { cwd: repoRoot, encoding: "utf8" },
      );

      expect(pendingResult.status).toBe(0);

      writeRepoFile(
        repoRoot,
        "trace/phase2/status.yaml",
        [
          'phase: "2"',
          "status: builder_ready",
          "exit_criteria:",
          "  builder_batches_complete:",
          "    status: met",
          "",
        ].join("\n"),
      );

      const result = spawnSync(
        process.execPath,
        ["--experimental-strip-types", path.resolve("scripts/phase-check.ts")],
        { cwd: repoRoot, encoding: "utf8" },
      );

      expect(result.status).toBe(1);
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  });

  it("accepts Phase 3 Architect open routing after Phase 2 reviewer closeout", () => {
    const repoRoot = mkdtempSync(path.join(tmpdir(), "cadenza-phase3-open-"));

    try {
      writeRepoFile(
        repoRoot,
        "STATUS.yaml",
        [
          'current_phase: "3"',
          "current_phase_name: AI Authoring Strengthening",
          "current_phase_status: architect_stage_a_open",
          "current_phase_trace: trace/phase3/",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "package.json",
        JSON.stringify(
          {
            scripts: {
              "format:check": "biome format .",
              lint: "biome check .",
              "phase:check":
                "node --experimental-strip-types scripts/phase-check.ts",
              "spec:lint":
                "node --experimental-strip-types scripts/lint-specs.ts",
              test: "vitest run --passWithNoTests",
              typecheck: "tsc --noEmit",
            },
          },
          null,
          2,
        ),
      );
      for (const file of [
        "prompt/PHASE0_KICK_BUILDER.md",
        "prompt/PHASE1_KICK_BUILDER.md",
        "prompt/PHASE2_KICK_ARCHITECT.md",
        "prompt/PHASE3_KICK_ARCHITECT.md",
        "pnpm-workspace.yaml",
        "biome.jsonc",
        "tsconfig.json",
        "scripts/lint-specs.ts",
        "scripts/phase-check.ts",
        ".githooks/pre-commit",
        ".githooks/commit-msg",
        ".github/workflows/ci.yml",
        "trace/phase2/review-phase2-closeout.md",
        "trace/phase2/phase3-architect-handoff.md",
        "trace/phase3/tracker.md",
      ]) {
        writeRepoFile(repoRoot, file, "# placeholder\n");
      }
      writeRepoFile(
        repoRoot,
        "trace/phase2/status.yaml",
        [
          'phase: "2"',
          "status: complete",
          "exit_criteria:",
          "  reviewer_closeout_accepted:",
          "    status: met",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "trace/phase3/status.yaml",
        ['phase: "3"', "status: architect_stage_a_open", ""].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "spec/phase1/SPEC_TEST_MATRIX.md",
        [
          "---",
          "Status: CONTRACT_FROZEN",
          "---",
          "",
          "# Phase 1 Test Matrix",
          "",
        ].join("\n"),
      );

      const result = spawnSync(
        process.execPath,
        ["--experimental-strip-types", path.resolve("scripts/phase-check.ts")],
        { cwd: repoRoot, encoding: "utf8" },
      );

      expect(result.status).toBe(0);
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  });

  it("accepts Phase 3 Builder-ready routing after Architect freeze", () => {
    const repoRoot = mkdtempSync(
      path.join(tmpdir(), "cadenza-phase3-builder-"),
    );

    try {
      writeRepoFile(
        repoRoot,
        "STATUS.yaml",
        [
          'current_phase: "3"',
          "current_phase_name: AI Authoring Strengthening",
          "current_phase_status: builder_ready",
          "current_phase_trace: trace/phase3/",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "package.json",
        JSON.stringify(
          {
            scripts: {
              "format:check": "biome format .",
              lint: "biome check .",
              "phase:check":
                "node --experimental-strip-types scripts/phase-check.ts",
              "spec:lint":
                "node --experimental-strip-types scripts/lint-specs.ts",
              test: "vitest run --passWithNoTests",
              typecheck: "tsc --noEmit",
            },
          },
          null,
          2,
        ),
      );
      for (const file of [
        "prompt/PHASE0_KICK_BUILDER.md",
        "prompt/PHASE1_KICK_BUILDER.md",
        "prompt/PHASE2_KICK_ARCHITECT.md",
        "prompt/PHASE3_KICK_ARCHITECT.md",
        "prompt/PHASE3_KICK_BUILDER.md",
        "pnpm-workspace.yaml",
        "biome.jsonc",
        "tsconfig.json",
        "scripts/lint-specs.ts",
        "scripts/phase-check.ts",
        ".githooks/pre-commit",
        ".githooks/commit-msg",
        ".github/workflows/ci.yml",
        "trace/phase2/review-phase2-closeout.md",
        "trace/phase2/phase3-architect-handoff.md",
        "trace/phase3/tracker.md",
      ]) {
        writeRepoFile(repoRoot, file, "# placeholder\n");
      }
      writeRepoFile(
        repoRoot,
        "trace/phase2/status.yaml",
        [
          'phase: "2"',
          "status: complete",
          "exit_criteria:",
          "  reviewer_closeout_accepted:",
          "    status: met",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "trace/phase3/status.yaml",
        ['phase: "3"', "status: builder_ready", ""].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "spec/phase1/SPEC_TEST_MATRIX.md",
        [
          "---",
          "Status: CONTRACT_FROZEN",
          "---",
          "",
          "# Phase 1 Test Matrix",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "spec/phase3/SPEC_TEST_MATRIX.md",
        [
          "---",
          "Status: CONTRACT_FROZEN",
          "---",
          "",
          "# Phase 3 Test Matrix",
          "",
        ].join("\n"),
      );

      const result = spawnSync(
        process.execPath,
        ["--experimental-strip-types", path.resolve("scripts/phase-check.ts")],
        { cwd: repoRoot, encoding: "utf8" },
      );

      expect(result.status).toBe(0);
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  });

  it("accepts Phase 4 Builder-ready routing after Phase 3 reviewer closeout", () => {
    const repoRoot = mkdtempSync(
      path.join(tmpdir(), "cadenza-phase4-builder-"),
    );

    try {
      writeRepoFile(
        repoRoot,
        "STATUS.yaml",
        [
          'current_phase: "4"',
          "current_phase_name: Presentation Product Layer (pruned)",
          "current_phase_status: builder_ready",
          "current_phase_trace: trace/phase4/",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "package.json",
        JSON.stringify(
          {
            scripts: {
              "format:check": "biome format .",
              lint: "biome check .",
              "phase:check":
                "node --experimental-strip-types scripts/phase-check.ts",
              "spec:lint":
                "node --experimental-strip-types scripts/lint-specs.ts",
              test: "vitest run --passWithNoTests",
              typecheck: "tsc --noEmit",
            },
          },
          null,
          2,
        ),
      );
      for (const file of [
        "prompt/PHASE0_KICK_BUILDER.md",
        "prompt/PHASE1_KICK_BUILDER.md",
        "prompt/PHASE2_KICK_ARCHITECT.md",
        "prompt/PHASE3_KICK_ARCHITECT.md",
        "prompt/PHASE4_KICK_BUILDER.md",
        "pnpm-workspace.yaml",
        "biome.jsonc",
        "tsconfig.json",
        "scripts/lint-specs.ts",
        "scripts/phase-check.ts",
        ".githooks/pre-commit",
        ".githooks/commit-msg",
        ".github/workflows/ci.yml",
        "trace/phase3/review-phase3-closeout.md",
        "trace/phase3/phase4-architect-handoff.md",
        "trace/phase4/tracker.md",
      ]) {
        writeRepoFile(repoRoot, file, "# placeholder\n");
      }
      writeRepoFile(
        repoRoot,
        "trace/phase3/status.yaml",
        [
          'phase: "3"',
          "status: complete",
          "exit_criteria:",
          "  reviewer_closeout_accepted:",
          "    status: met",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "trace/phase4/status.yaml",
        ['phase: "4"', "status: builder_ready", ""].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "spec/phase1/SPEC_TEST_MATRIX.md",
        [
          "---",
          "Status: CONTRACT_FROZEN",
          "---",
          "",
          "# Phase 1 Test Matrix",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "spec/phase4/SPEC_TEST_MATRIX.md",
        [
          "---",
          "Status: CONTRACT_FROZEN",
          "---",
          "",
          "# Phase 4 Test Matrix",
          "",
        ].join("\n"),
      );

      const result = spawnSync(
        process.execPath,
        ["--experimental-strip-types", path.resolve("scripts/phase-check.ts")],
        { cwd: repoRoot, encoding: "utf8" },
      );

      expect(result.status).toBe(0);
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  });

  it("accepts Phase 5 Builder-ready routing after Phase 4 reviewer closeout", () => {
    const repoRoot = mkdtempSync(
      path.join(tmpdir(), "cadenza-phase5-builder-"),
    );

    try {
      writeRepoFile(
        repoRoot,
        "STATUS.yaml",
        [
          'current_phase: "5"',
          "current_phase_name: Export + 0.1 Alpha Readiness",
          "current_phase_status: builder_ready",
          "current_phase_trace: trace/phase5/",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "package.json",
        JSON.stringify(
          {
            scripts: {
              "format:check": "biome format .",
              lint: "biome check .",
              "phase:check":
                "node --experimental-strip-types scripts/phase-check.ts",
              "spec:lint":
                "node --experimental-strip-types scripts/lint-specs.ts",
              test: "vitest run --passWithNoTests",
              typecheck: "tsc --noEmit",
            },
          },
          null,
          2,
        ),
      );
      for (const file of [
        "prompt/PHASE0_KICK_BUILDER.md",
        "prompt/PHASE1_KICK_BUILDER.md",
        "prompt/PHASE2_KICK_ARCHITECT.md",
        "prompt/PHASE3_KICK_ARCHITECT.md",
        "prompt/PHASE5_KICK_BUILDER.md",
        "pnpm-workspace.yaml",
        "biome.jsonc",
        "tsconfig.json",
        "scripts/lint-specs.ts",
        "scripts/phase-check.ts",
        ".githooks/pre-commit",
        ".githooks/commit-msg",
        ".github/workflows/ci.yml",
        "trace/phase4/review-phase4-closeout.md",
        "trace/phase4/phase5-architect-handoff.md",
        "trace/phase5/tracker.md",
      ]) {
        writeRepoFile(repoRoot, file, "# placeholder\n");
      }
      writeRepoFile(
        repoRoot,
        "trace/phase4/status.yaml",
        [
          'phase: "4"',
          "status: complete",
          "exit_criteria:",
          "  reviewer_closeout_accepted:",
          "    status: met",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "trace/phase5/status.yaml",
        ['phase: "5"', "status: builder_ready", ""].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "spec/phase1/SPEC_TEST_MATRIX.md",
        [
          "---",
          "Status: CONTRACT_FROZEN",
          "---",
          "",
          "# Phase 1 Test Matrix",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "spec/phase5/SPEC_TEST_MATRIX.md",
        [
          "---",
          "Status: CONTRACT_FROZEN",
          "---",
          "",
          "# Phase 5 Test Matrix",
          "",
        ].join("\n"),
      );

      const result = spawnSync(
        process.execPath,
        ["--experimental-strip-types", path.resolve("scripts/phase-check.ts")],
        { cwd: repoRoot, encoding: "utf8" },
      );

      expect(result.status).toBe(0);
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  });

  it("accepts Phase 6 Builder-ready routing after Phase 5 closeout and Phase 5.5 hygiene", () => {
    const repoRoot = mkdtempSync(
      path.join(tmpdir(), "cadenza-phase6-builder-"),
    );

    try {
      writeRepoFile(
        repoRoot,
        "STATUS.yaml",
        [
          'current_phase: "6"',
          "current_phase_name: Universal CLI and Local Export Engine",
          "current_phase_status: builder_ready",
          "current_phase_trace: trace/phase6/",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "package.json",
        JSON.stringify(
          {
            scripts: {
              "format:check": "biome format .",
              lint: "biome check .",
              "phase:check":
                "node --experimental-strip-types scripts/phase-check.ts",
              "spec:lint":
                "node --experimental-strip-types scripts/lint-specs.ts",
              test: "vitest run --passWithNoTests",
              typecheck: "tsc --noEmit",
            },
          },
          null,
          2,
        ),
      );
      for (const file of [
        "prompt/PHASE0_KICK_BUILDER.md",
        "prompt/PHASE1_KICK_BUILDER.md",
        "prompt/PHASE2_KICK_ARCHITECT.md",
        "prompt/PHASE3_KICK_ARCHITECT.md",
        "prompt/PHASE6_KICK_BUILDER.md",
        "pnpm-workspace.yaml",
        "biome.jsonc",
        "tsconfig.json",
        "scripts/lint-specs.ts",
        "scripts/phase-check.ts",
        ".githooks/pre-commit",
        ".githooks/commit-msg",
        ".github/workflows/ci.yml",
        "trace/phase5/review-phase5-closeout.md",
        "trace/phase5-5/review-phase5-5-hygiene.md",
        "trace/phase5-5/phase6-architect-handoff.md",
        "trace/phase6/tracker.md",
        "docs/adr/0016-phase-6-local-cli-export-package-topology.md",
      ]) {
        writeRepoFile(repoRoot, file, "# placeholder\n");
      }
      writeRepoFile(
        repoRoot,
        "trace/phase5-5/status.yaml",
        ['phase: "5.5"', "status: reviewer_accepted", ""].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "trace/phase6/status.yaml",
        ['phase: "6"', "status: builder_ready", ""].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "spec/phase1/SPEC_TEST_MATRIX.md",
        [
          "---",
          "Status: CONTRACT_FROZEN",
          "---",
          "",
          "# Phase 1 Test Matrix",
          "",
        ].join("\n"),
      );
      writeRepoFile(
        repoRoot,
        "spec/phase6/SPEC_TEST_MATRIX.md",
        [
          "---",
          "Status: CONTRACT_FROZEN",
          "---",
          "",
          "# Phase 6 Test Matrix",
          "",
        ].join("\n"),
      );

      const result = spawnSync(
        process.execPath,
        ["--experimental-strip-types", path.resolve("scripts/phase-check.ts")],
        { cwd: repoRoot, encoding: "utf8" },
      );

      expect(result.status).toBe(0);
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  });
});

describe("Phase 5 acceptance evidence taxonomy", () => {
  it("keeps phase-bound export acceptance evidence out of package-local tests", () => {
    const report = createTraceabilityCoverageReport({
      phase: "5",
      repoRoot: process.cwd(),
    });
    const pexp001 = report.requirements.find(
      (requirement) => requirement.id === "PEXP-001",
    );

    expect(report.sources.testFiles).toContain(
      "tests/acceptance/phase5-export.test.ts",
    );
    expect(report.sources.testFiles).toContain(
      "tests/browser/phase5-export-parity.spec.ts",
    );
    expect(report.sources.testFiles).not.toContain(
      "packages/core/src/phase5-export.test.ts",
    );
    expect(pexp001?.testEvidenceFiles).toEqual(
      expect.arrayContaining([
        "tests/acceptance/phase5-export.test.ts",
        "tests/browser/phase5-export-parity.spec.ts",
      ]),
    );
  });
});

describe("Phase 5 generated artifact ownership", () => {
  it("classifies ignored live export outputs as regenerate-owned evidence instead of missing tracked trace files", () => {
    const report = createTraceabilityCoverageReport({
      phase: "5",
      repoRoot: process.cwd(),
    });

    expect(report.traceScope.generatedEvidencePaths).toEqual(
      expect.arrayContaining([
        "dist/phase5/phase5-alpha-readiness-talk/b5-6-manual/manifest.json",
        "dist/phase5/phase5-alpha-readiness-talk/b5-6-manual/export-evidence.json",
      ]),
    );
    expect(report.traceScope.statusEvidencePathsMissing).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/^dist\//)]),
    );
    expect(report.traceScope.statusEvidencePathsMissing).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/^B5\./)]),
    );
  });
});

describe("repo artifact smoke taxonomy", () => {
  it("keeps cadenza-best-practices repo artifact checks out of package-local tests", () => {
    const report = createTraceabilityCoverageReport({
      phase: "3",
      repoRoot: process.cwd(),
    });

    expect(report.sources.testFiles).toContain(
      "tests/repo/phase3-best-practices-rules.test.ts",
    );
    expect(report.sources.testFiles).not.toContain(
      "packages/core/src/phase3-best-practices-rules.test.ts",
    );
  });
});

describe("evidence scan hygiene", () => {
  it("does not collect test evidence from nested node_modules workspace links", () => {
    const report = createTraceabilityCoverageReport({
      phase: "5",
      repoRoot: process.cwd(),
    });

    expect(report.sources.testFiles).not.toEqual(
      expect.arrayContaining([expect.stringContaining("/node_modules/")]),
    );
    expect(report.sources.implementationFiles).not.toEqual(
      expect.arrayContaining([expect.stringContaining("/node_modules/")]),
    );
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
          file: "wip/architect/phase1-traceability-coverage.md",
          marker: "Promoted into Phase 2 draft contract",
        },
      ]),
    );
    expect(report.traceScope.deferredItems).not.toEqual(
      expect.arrayContaining([
        {
          file: "TODO.md",
          marker: "active-phase-only hard gate",
        },
      ]),
    );
    expect(report.revP1004Disposition).toMatchObject({
      currentDisposition: "promoted_to_active_phase_only_closeout_gate",
      deferredFollowUp: "none",
      frozenPhase1SpecsEdited: false,
      sourceFinding: "trace/phase1/review-phase1-closeout.md",
    });

    const markdown = formatTraceabilityCoverageMarkdown(report);

    expect(markdown).toContain("## REV-P1-004 Disposition");
    expect(markdown).toContain("REV-P1-004");
    expect(markdown).toContain("promoted_to_active_phase_only_closeout_gate");
  });
});
