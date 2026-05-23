import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type Finding = {
  level: "error" | "info";
  message: string;
};

const repoRoot = process.cwd();
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const traceabilityCoverageModule = (await import(
  pathToFileURL(path.join(scriptDir, "traceability-coverage.ts")).href
)) as typeof import("./traceability-coverage.js");
const findings: Finding[] = [];

function readText(file: string): string {
  return readFileSync(path.join(repoRoot, file), "utf8");
}

function exists(file: string): boolean {
  return existsSync(path.join(repoRoot, file));
}

function requirePath(file: string) {
  if (!exists(file)) {
    findings.push({ level: "error", message: `missing ${file}` });
  }
}

function yamlScalar(text: string, key: string): string | null {
  const match = text.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?\\s*$`, "m"));
  return match?.[1]?.trim() ?? null;
}

function indentedStatus(text: string, key: string): string | null {
  const pattern = new RegExp(
    `^  ${key}:\\n(?:    .+\\n)*?    status:\\s*([^\\n]+)`,
    "m",
  );
  const match = text.match(pattern);
  return match?.[1]?.trim() ?? null;
}

function exitCriterionStatus(text: string, key: string): string | null {
  const pattern = new RegExp(
    `^  ${key}:\\n(?:    .+\\n)*?    status:\\s*([^\\n]+)`,
    "m",
  );
  const match = text.match(pattern);
  return match?.[1]?.trim() ?? null;
}

function walkFiles(target: string): string[] {
  const absolute = path.join(repoRoot, target);
  if (!existsSync(absolute)) {
    return [];
  }
  const stats = statSync(absolute);
  if (stats.isFile()) {
    return [target];
  }
  const files: string[] = [];
  for (const entry of readdirSync(absolute)) {
    const child = path.join(target, entry);
    const childStats = statSync(path.join(repoRoot, child));
    if (childStats.isDirectory()) {
      files.push(...walkFiles(child));
    } else {
      files.push(child);
    }
  }
  return files;
}

function checkActivePhaseTraceabilityCoverage(phase: string) {
  const report = traceabilityCoverageModule.createTraceabilityCoverageReport({
    phase,
    repoRoot,
  });

  if (report.findings.length > 0) {
    findings.push({
      level: "error",
      message: `active-phase traceability coverage check failed for phase ${phase}:\n${report.findings
        .map((finding) => `- ${finding}`)
        .join("\n")}`,
    });
  }
}

requirePath("STATUS.yaml");
requirePath("prompt/PHASE0_KICK_BUILDER.md");
requirePath("prompt/PHASE1_KICK_BUILDER.md");
requirePath("prompt/PHASE2_KICK_ARCHITECT.md");
requirePath("prompt/PHASE3_KICK_ARCHITECT.md");
requirePath("package.json");
requirePath("pnpm-workspace.yaml");
requirePath("biome.jsonc");
requirePath("tsconfig.json");
requirePath("scripts/lint-specs.ts");
requirePath("scripts/phase-check.ts");
requirePath(".githooks/pre-commit");
requirePath(".githooks/commit-msg");
requirePath(".github/workflows/ci.yml");

let currentPhase: string | null = null;
if (exists("STATUS.yaml")) {
  const rootStatus = readText("STATUS.yaml");
  currentPhase = yamlScalar(rootStatus, "current_phase");
  if (
    currentPhase !== "0" &&
    currentPhase !== "1" &&
    currentPhase !== "2" &&
    currentPhase !== "3" &&
    currentPhase !== "4"
  ) {
    findings.push({
      level: "error",
      message: `STATUS.yaml current_phase is ${currentPhase ?? "(missing)"}, expected 0, 1, 2, 3, or 4`,
    });
  }
}

function checkPhase0() {
  requirePath("trace/phase0/status.yaml");
  requirePath("trace/phase0/tracker.md");

  if (!exists("trace/phase0/status.yaml")) {
    return;
  }

  const phaseStatus = readText("trace/phase0/status.yaml");
  const requiredMissions = new Map([
    ["M1_compiler_design_review", "contract_frozen"],
    ["M2_pending_adrs", "complete"],
    ["M3_phase1_stage_a_specs", "stage_b_frozen"],
    ["M4_remotion_notification", "complete"],
    ["M5_agentic_workflow_finalize", "complete"],
    ["M6_downstream_kick_files", "complete"],
  ]);

  for (const [mission, expected] of requiredMissions) {
    const actual = indentedStatus(phaseStatus, mission);
    if (actual !== expected) {
      findings.push({
        level: "error",
        message: `${mission} status is ${actual ?? "(missing)"}, expected ${expected}`,
      });
    }
  }

  const requiredMetCriteria = [
    "compiler_design_contract_frozen",
    "adr_0001_to_0010_present",
    "adr_0011_present_if_remotion_email_sent",
    "phase1_stage_a_specs_present",
    "phase1_stage_b_specs_frozen",
    "future_support_followups_recorded",
    "agentic_workflow_finalized",
    "phase0_builder_kick_exists",
    "phase1_builder_kick_exists",
    "phase1_architect_kick_not_required",
    "phase0_builder_kick_decision_recorded",
    "remotion_notification_outcome_recorded_if_sent",
    "phase0_infra_bootstrap_runnable",
  ];

  for (const criterion of requiredMetCriteria) {
    const actual = exitCriterionStatus(phaseStatus, criterion);
    if (actual !== "met") {
      findings.push({
        level: "error",
        message: `${criterion} status is ${actual ?? "(missing)"}, expected met`,
      });
    }
  }

  const pointerStatus = exitCriterionStatus(
    phaseStatus,
    "phase_pointer_advanced_to_1",
  );
  if (pointerStatus !== "met") {
    findings.push({
      level: "info",
      message:
        "phase_pointer_advanced_to_1 is still pending human phase close; this does not block Phase 0 Builder bootstrap",
    });
  }
}

function checkPhase1Initial() {
  if (exists("trace/phase1/status.yaml")) {
    const phaseStatus = readText("trace/phase1/status.yaml");
    const phase = yamlScalar(phaseStatus, "phase");
    if (phase !== "1") {
      findings.push({
        level: "error",
        message: `trace/phase1/status.yaml phase is ${phase ?? "(missing)"}, expected 1`,
      });
    }
  } else {
    findings.push({
      level: "info",
      message:
        "trace/phase1/status.yaml is not present yet; Phase 1 Builder should create it during the first implementation batch",
    });
  }

  if (!exists("trace/phase1/tracker.md")) {
    findings.push({
      level: "info",
      message:
        "trace/phase1/tracker.md is not present yet; Phase 1 Builder should create it during the first implementation batch",
    });
  }
}

function checkPhase2Initial() {
  requirePath("trace/phase1/status.yaml");
  requirePath("trace/phase1/review-phase1-closeout.md");
  requirePath("trace/phase2/status.yaml");
  requirePath("trace/phase2/tracker.md");

  if (exists("trace/phase1/status.yaml")) {
    const phase1Status = readText("trace/phase1/status.yaml");
    const phase1 = yamlScalar(phase1Status, "phase");
    const phase1Lifecycle = yamlScalar(phase1Status, "status");
    const pointerStatus = exitCriterionStatus(
      phase1Status,
      "phase_pointer_advanced_after_maintainer_approval",
    );

    if (phase1 !== "1") {
      findings.push({
        level: "error",
        message: `trace/phase1/status.yaml phase is ${phase1 ?? "(missing)"}, expected 1`,
      });
    }
    if (phase1Lifecycle !== "complete") {
      findings.push({
        level: "error",
        message: `trace/phase1/status.yaml status is ${phase1Lifecycle ?? "(missing)"}, expected complete`,
      });
    }
    if (pointerStatus !== "met") {
      findings.push({
        level: "error",
        message: `phase_pointer_advanced_after_maintainer_approval status is ${pointerStatus ?? "(missing)"}, expected met`,
      });
    }
  }

  if (exists("trace/phase2/status.yaml")) {
    const phase2Status = readText("trace/phase2/status.yaml");
    const phase2 = yamlScalar(phase2Status, "phase");
    const phase2Lifecycle = yamlScalar(phase2Status, "status");

    if (phase2 !== "2") {
      findings.push({
        level: "error",
        message: `trace/phase2/status.yaml phase is ${phase2 ?? "(missing)"}, expected 2`,
      });
    }
    const allowedPhase2Statuses = new Set([
      "architect_stage_a_open",
      "builder_ready",
      "complete",
    ]);
    if (
      phase2Lifecycle === null ||
      !allowedPhase2Statuses.has(phase2Lifecycle)
    ) {
      findings.push({
        level: "error",
        message: `trace/phase2/status.yaml status is ${phase2Lifecycle ?? "(missing)"}, expected one of ${Array.from(allowedPhase2Statuses).join(", ")}`,
      });
    }

    if (phase2Lifecycle === "builder_ready" || phase2Lifecycle === "complete") {
      requirePath("prompt/PHASE2_KICK_BUILDER.md");
      const phase2Specs = walkFiles("spec/phase2").filter((file) =>
        file.endsWith(".md"),
      );
      if (phase2Specs.length === 0) {
        findings.push({
          level: "error",
          message: "spec/phase2 has no Markdown specs",
        });
      }
      for (const file of phase2Specs) {
        const text = readText(file);
        if (!/^Status:\s*CONTRACT_FROZEN$/m.test(text)) {
          findings.push({
            level: "error",
            message: `${file} is not CONTRACT_FROZEN`,
          });
        }
        if (/Freeze Candidate/i.test(text) || /\*\*FC-ID\*\*:/i.test(text)) {
          findings.push({
            level: "error",
            message: `${file} contains unresolved Freeze Candidate marker`,
          });
        }
      }

      if (
        exitCriterionStatus(phase2Status, "builder_batches_complete") === "met"
      ) {
        checkActivePhaseTraceabilityCoverage("2");
      }

      if (
        phase2Lifecycle === "complete" &&
        exitCriterionStatus(phase2Status, "reviewer_closeout_accepted") !==
          "met"
      ) {
        findings.push({
          level: "error",
          message:
            "trace/phase2/status.yaml status is complete but reviewer_closeout_accepted is not met",
        });
      }
    }
  }
}

function checkPhase3Initial() {
  requirePath("trace/phase2/status.yaml");
  requirePath("trace/phase2/review-phase2-closeout.md");
  requirePath("trace/phase2/phase3-architect-handoff.md");
  requirePath("trace/phase3/status.yaml");
  requirePath("trace/phase3/tracker.md");

  if (exists("trace/phase2/status.yaml")) {
    const phase2Status = readText("trace/phase2/status.yaml");
    const phase2 = yamlScalar(phase2Status, "phase");
    const phase2Lifecycle = yamlScalar(phase2Status, "status");
    const reviewerAccepted = exitCriterionStatus(
      phase2Status,
      "reviewer_closeout_accepted",
    );

    if (phase2 !== "2") {
      findings.push({
        level: "error",
        message: `trace/phase2/status.yaml phase is ${phase2 ?? "(missing)"}, expected 2`,
      });
    }
    if (phase2Lifecycle !== "complete") {
      findings.push({
        level: "error",
        message: `trace/phase2/status.yaml status is ${phase2Lifecycle ?? "(missing)"}, expected complete`,
      });
    }
    if (reviewerAccepted !== "met") {
      findings.push({
        level: "error",
        message: `reviewer_closeout_accepted status is ${reviewerAccepted ?? "(missing)"}, expected met`,
      });
    }
  }

  if (exists("trace/phase3/status.yaml")) {
    const phase3Status = readText("trace/phase3/status.yaml");
    const phase3 = yamlScalar(phase3Status, "phase");
    const phase3Lifecycle = yamlScalar(phase3Status, "status");

    if (phase3 !== "3") {
      findings.push({
        level: "error",
        message: `trace/phase3/status.yaml phase is ${phase3 ?? "(missing)"}, expected 3`,
      });
    }
    const allowedPhase3Statuses = new Set([
      "architect_stage_a_open",
      "builder_ready",
      "complete",
    ]);
    if (
      phase3Lifecycle === null ||
      !allowedPhase3Statuses.has(phase3Lifecycle)
    ) {
      findings.push({
        level: "error",
        message: `trace/phase3/status.yaml status is ${phase3Lifecycle ?? "(missing)"}, expected one of ${Array.from(allowedPhase3Statuses).join(", ")}`,
      });
    }

    if (phase3Lifecycle === "builder_ready" || phase3Lifecycle === "complete") {
      requirePath("prompt/PHASE3_KICK_BUILDER.md");
      const phase3Specs = walkFiles("spec/phase3").filter((file) =>
        file.endsWith(".md"),
      );
      if (phase3Specs.length === 0) {
        findings.push({
          level: "error",
          message: "spec/phase3 has no Markdown specs",
        });
      }
      for (const file of phase3Specs) {
        const text = readText(file);
        if (!/^Status:\s*CONTRACT_FROZEN$/m.test(text)) {
          findings.push({
            level: "error",
            message: `${file} is not CONTRACT_FROZEN`,
          });
        }
        if (/Freeze Candidate/i.test(text) || /\*\*FC-ID\*\*:/i.test(text)) {
          findings.push({
            level: "error",
            message: `${file} contains unresolved Freeze Candidate marker`,
          });
        }
      }

      if (
        phase3Lifecycle === "complete" &&
        exitCriterionStatus(phase3Status, "reviewer_closeout_accepted") !==
          "met"
      ) {
        findings.push({
          level: "error",
          message:
            "trace/phase3/status.yaml status is complete but reviewer_closeout_accepted is not met",
        });
      }
    }
  }
}

function checkPhase4Initial() {
  requirePath("trace/phase3/status.yaml");
  requirePath("trace/phase3/review-phase3-closeout.md");
  requirePath("trace/phase3/phase4-architect-handoff.md");
  requirePath("trace/phase4/status.yaml");
  requirePath("trace/phase4/tracker.md");

  if (exists("trace/phase3/status.yaml")) {
    const phase3Status = readText("trace/phase3/status.yaml");
    const phase3 = yamlScalar(phase3Status, "phase");
    const phase3Lifecycle = yamlScalar(phase3Status, "status");
    const reviewerAccepted = exitCriterionStatus(
      phase3Status,
      "reviewer_closeout_accepted",
    );

    if (phase3 !== "3") {
      findings.push({
        level: "error",
        message: `trace/phase3/status.yaml phase is ${phase3 ?? "(missing)"}, expected 3`,
      });
    }
    if (phase3Lifecycle !== "complete") {
      findings.push({
        level: "error",
        message: `trace/phase3/status.yaml status is ${phase3Lifecycle ?? "(missing)"}, expected complete`,
      });
    }
    if (reviewerAccepted !== "met") {
      findings.push({
        level: "error",
        message: `reviewer_closeout_accepted status is ${reviewerAccepted ?? "(missing)"}, expected met`,
      });
    }
  }

  if (exists("trace/phase4/status.yaml")) {
    const phase4Status = readText("trace/phase4/status.yaml");
    const phase4 = yamlScalar(phase4Status, "phase");
    const phase4Lifecycle = yamlScalar(phase4Status, "status");

    if (phase4 !== "4") {
      findings.push({
        level: "error",
        message: `trace/phase4/status.yaml phase is ${phase4 ?? "(missing)"}, expected 4`,
      });
    }
    const allowedPhase4Statuses = new Set(["builder_ready", "complete"]);
    if (
      phase4Lifecycle === null ||
      !allowedPhase4Statuses.has(phase4Lifecycle)
    ) {
      findings.push({
        level: "error",
        message: `trace/phase4/status.yaml status is ${phase4Lifecycle ?? "(missing)"}, expected one of ${Array.from(allowedPhase4Statuses).join(", ")}`,
      });
    }

    if (phase4Lifecycle === "builder_ready" || phase4Lifecycle === "complete") {
      requirePath("prompt/PHASE4_KICK_BUILDER.md");
      const phase4Specs = walkFiles("spec/phase4").filter((file) =>
        file.endsWith(".md"),
      );
      if (phase4Specs.length === 0) {
        findings.push({
          level: "error",
          message: "spec/phase4 has no Markdown specs",
        });
      }
      for (const file of phase4Specs) {
        const text = readText(file);
        if (!/^Status:\s*CONTRACT_FROZEN$/m.test(text)) {
          findings.push({
            level: "error",
            message: `${file} is not CONTRACT_FROZEN`,
          });
        }
        if (/Freeze Candidate/i.test(text) || /\*\*FC-ID\*\*:/i.test(text)) {
          findings.push({
            level: "error",
            message: `${file} contains unresolved Freeze Candidate marker`,
          });
        }
      }

      if (
        exitCriterionStatus(phase4Status, "builder_batches_complete") === "met"
      ) {
        checkActivePhaseTraceabilityCoverage("4");
      }

      if (
        phase4Lifecycle === "complete" &&
        exitCriterionStatus(phase4Status, "reviewer_closeout_accepted") !==
          "met"
      ) {
        findings.push({
          level: "error",
          message:
            "trace/phase4/status.yaml status is complete but reviewer_closeout_accepted is not met",
        });
      }
    }
  }
}

if (currentPhase === "0") {
  checkPhase0();
} else if (currentPhase === "1") {
  checkPhase1Initial();
} else if (currentPhase === "2") {
  checkPhase2Initial();
} else if (currentPhase === "3") {
  checkPhase3Initial();
} else if (currentPhase === "4") {
  checkPhase4Initial();
}

const phase1Specs = walkFiles("spec/phase1").filter((file) =>
  file.endsWith(".md"),
);
if (phase1Specs.length === 0) {
  findings.push({
    level: "error",
    message: "spec/phase1 has no Markdown specs",
  });
}
for (const file of phase1Specs) {
  const text = readText(file);
  if (!/^Status:\s*CONTRACT_FROZEN$/m.test(text)) {
    findings.push({
      level: "error",
      message: `${file} is not CONTRACT_FROZEN`,
    });
  }
  if (/Freeze Candidate/i.test(text) || /\*\*FC-ID\*\*:/i.test(text)) {
    findings.push({
      level: "error",
      message: `${file} contains unresolved Freeze Candidate marker`,
    });
  }
}

if (currentPhase === "0") {
  const productionSources = walkFiles("packages").filter((file) =>
    /(^|\/)src\//.test(file),
  );
  if (productionSources.length > 0) {
    findings.push({
      level: "error",
      message: `Phase 0 must not contain production sources: ${productionSources.join(", ")}`,
    });
  }
}

const packageJson = exists("package.json")
  ? JSON.parse(readText("package.json"))
  : {};
for (const scriptName of [
  "typecheck",
  "test",
  "lint",
  "format:check",
  "spec:lint",
  "phase:check",
]) {
  if (!packageJson.scripts?.[scriptName]) {
    findings.push({
      level: "error",
      message: `package.json missing script ${scriptName}`,
    });
  }
}

const errorCount = findings.filter(
  (finding) => finding.level === "error",
).length;
for (const finding of findings) {
  console.log(`${finding.level}: ${finding.message}`);
}

if (errorCount > 0) {
  console.log(`phase:check failed (${errorCount} error(s))`);
  process.exit(1);
}

console.log("phase:check OK");
