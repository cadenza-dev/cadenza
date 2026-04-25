import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

type Finding = {
  level: "error" | "info";
  message: string;
};

const repoRoot = process.cwd();
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

requirePath("STATUS.yaml");
requirePath("prompt/PHASE0_KICK_BUILDER.md");
requirePath("prompt/PHASE1_KICK_BUILDER.md");
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
  if (currentPhase !== "0" && currentPhase !== "1") {
    findings.push({
      level: "error",
      message: `STATUS.yaml current_phase is ${currentPhase ?? "(missing)"}, expected 0 or 1`,
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

if (currentPhase === "0") {
  checkPhase0();
} else if (currentPhase === "1") {
  checkPhase1Initial();
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
