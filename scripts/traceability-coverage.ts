import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const TRACEABILITY_COVERAGE_REQUIREMENTS = [
  "TRAC-001",
  "TRAC-002",
  "TRAC-003",
  "TRAC-004",
  "TRAC-005",
  "TRAC-006",
] as const;

const REQUIREMENT_ID_PATTERN = /\b[A-Z]{2,6}-[0-9]{3,4}\b/g;
const TEST_ID_PATTERN = /\bTC-[A-Z]{2,6}-[0-9]{3,4}\b/g;
const REQUIREMENT_ID_EXACT_PATTERN = /^[A-Z]{2,6}-[0-9]{3,4}$/;
const TEST_ID_EXACT_PATTERN = /^TC-[A-Z]{2,6}-[0-9]{3,4}$/;
const PATH_LIKE_PATTERN = /^[\w@./-]+\.[\w]+$/;

type RequirementBlock = {
  file: string;
  id: string;
  priority: string | null;
};

type TestMatrixRow = {
  requirementIds: string[];
  scenario: string;
  testId: string;
};

type TraceabilityRow = {
  evidencePaths: string[];
  requirementId: string;
  testIds: string[];
};

export type TraceabilityRequirementCoverage = {
  id: string;
  implementationEvidenceFiles: string[];
  inSpec: boolean;
  matrixTestIds: string[];
  priority: string | null;
  sourceFiles: string[];
  testEvidenceFiles: string[];
  traceStatusEvidenceFiles: string[];
  traceabilityEvidencePaths: string[];
  traceabilityTestIds: string[];
};

export type TraceabilityCoverageReport = {
  findings: string[];
  nonGoals: Array<{
    acceptanceScenarioPresent: boolean;
    claim: string;
  }>;
  phase: string;
  requirements: TraceabilityRequirementCoverage[];
  sources: {
    implementationFiles: string[];
    specFiles: string[];
    testFiles: string[];
    testMatrix: string;
    traceStatus: string;
    traceabilityMatrix: string;
  };
  traceScope: {
    deferredItems: Array<{
      file: string;
      marker: string;
    }>;
    deferredWipFiles: string[];
    stageAStatus: string | null;
    stageBStatus: string | null;
    statusEvidencePathsMissing: string[];
  };
};

export type TraceabilityCoverageOptions = {
  phase?: string;
  repoRoot: string;
};

export function createTraceabilityCoverageReport(
  options: TraceabilityCoverageOptions,
): TraceabilityCoverageReport {
  const phase = options.phase ?? readCurrentPhase(options.repoRoot);
  const specDir = `spec/phase${phase}`;
  const traceDir = `trace/phase${phase}`;
  const testMatrixPath = `${specDir}/SPEC_TEST_MATRIX.md`;
  const traceabilityPath = `${specDir}/SPEC_TRACEABILITY.md`;
  const traceStatusPath = `${traceDir}/status.yaml`;

  const specFiles = walkFiles(options.repoRoot, specDir)
    .filter((file) => file.endsWith(".md"))
    .sort();
  const domainSpecFiles = specFiles.filter(
    (file) =>
      !file.endsWith("SPEC_TEST_MATRIX.md") &&
      !file.endsWith("SPEC_TRACEABILITY.md"),
  );
  const testFiles = walkFiles(options.repoRoot, ".")
    .filter((file) => /\.(test|spec)\.tsx?$/.test(file))
    .sort();
  const implementationFiles = walkFiles(options.repoRoot, ".")
    .filter((file) => /\.(ts|tsx)$/.test(file))
    .filter((file) => !/\.(test|spec)\.tsx?$/.test(file))
    .filter((file) => !file.startsWith("node_modules/"))
    .filter((file) => !file.startsWith("tmp/"))
    .sort();

  const requirementBlocks = domainSpecFiles.flatMap((file) =>
    extractRequirementBlocks(file, readRelative(options.repoRoot, file)),
  );
  const testRows = extractTestMatrixRows(
    readRelative(options.repoRoot, testMatrixPath),
  );
  const traceRows = extractTraceabilityRows(
    readRelative(options.repoRoot, traceabilityPath),
  );
  const traceStatus = readRelative(options.repoRoot, traceStatusPath);
  const statusEvidencePaths = extractStatusEvidencePaths(traceStatus);
  const statusRequirementEvidence = extractRequirementEvidenceFromStatus(
    traceStatus,
    statusEvidencePaths,
  );

  const requirementIds = uniqueSorted([
    ...requirementBlocks.map((block) => block.id),
    ...testRows.flatMap((row) => row.requirementIds),
    ...traceRows.map((row) => row.requirementId),
  ]);

  const requirements = requirementIds.map((id) => {
    const matchingBlocks = requirementBlocks.filter((block) => block.id === id);
    const matrixRows = testRows.filter((row) =>
      row.requirementIds.includes(id),
    );
    const traceabilityRows = traceRows.filter(
      (row) => row.requirementId === id,
    );
    const relatedTestIds = uniqueSorted([
      ...matrixRows.map((row) => row.testId),
      ...traceabilityRows.flatMap((row) => row.testIds),
    ]);

    return {
      id,
      implementationEvidenceFiles: filesContainingAny(
        options.repoRoot,
        implementationFiles,
        [id, ...relatedTestIds],
      ),
      inSpec: matchingBlocks.length > 0,
      matrixTestIds: uniqueSorted(matrixRows.map((row) => row.testId)),
      priority: matchingBlocks[0]?.priority ?? null,
      sourceFiles: uniqueSorted(matchingBlocks.map((block) => block.file)),
      testEvidenceFiles: filesContainingAny(options.repoRoot, testFiles, [
        id,
        ...relatedTestIds,
      ]),
      traceStatusEvidenceFiles: statusRequirementEvidence.get(id) ?? [],
      traceabilityEvidencePaths: uniqueSorted(
        traceabilityRows.flatMap((row) => row.evidencePaths),
      ),
      traceabilityTestIds: uniqueSorted(
        traceabilityRows.flatMap((row) => row.testIds),
      ),
    };
  });

  return {
    findings: createFindings(requirements),
    nonGoals: createNonGoalEvidence(testRows),
    phase,
    requirements,
    sources: {
      implementationFiles,
      specFiles,
      testFiles,
      testMatrix: testMatrixPath,
      traceStatus: traceStatusPath,
      traceabilityMatrix: traceabilityPath,
    },
    traceScope: {
      deferredItems: collectDeferredItems(options.repoRoot),
      deferredWipFiles: collectDeferredWipFiles(options.repoRoot),
      stageAStatus: extractNestedStatus(traceStatus, "architect_stage_a"),
      stageBStatus: extractNestedStatus(traceStatus, "architect_stage_b"),
      statusEvidencePathsMissing: statusEvidencePaths.filter(
        (file) => !existsSync(path.join(options.repoRoot, file)),
      ),
    },
  };
}

export function formatTraceabilityCoverageMarkdown(
  report: TraceabilityCoverageReport,
): string {
  const summaryRows = [
    ["Phase", report.phase],
    ["Requirements scanned", String(report.requirements.length)],
    [
      "Requirements in specs",
      String(
        report.requirements.filter((requirement) => requirement.inSpec).length,
      ),
    ],
    [
      "Requirements in test matrix",
      String(
        report.requirements.filter(
          (requirement) => requirement.matrixTestIds.length > 0,
        ).length,
      ),
    ],
    [
      "Requirements in traceability matrix",
      String(
        report.requirements.filter(
          (requirement) => requirement.traceabilityTestIds.length > 0,
        ).length,
      ),
    ],
  ];

  const requirementRows = report.requirements.map((requirement) => [
    requirement.id,
    requirement.priority ?? "-",
    yesNo(requirement.inSpec),
    joinOrDash(requirement.matrixTestIds),
    joinOrDash(requirement.traceabilityTestIds),
    joinOrDash(requirement.traceStatusEvidenceFiles),
    joinOrDash(requirement.testEvidenceFiles),
    joinOrDash(requirement.implementationEvidenceFiles),
  ]);

  const nonGoalRows = report.nonGoals.map((nonGoal) => [
    nonGoal.claim,
    nonGoal.acceptanceScenarioPresent
      ? "unexpected acceptance scenario"
      : "absent by design",
  ]);

  const findings =
    report.findings.length === 0
      ? "- No blocking coverage gaps were promoted by this non-mutating report."
      : report.findings.map((finding) => `- ${finding}`).join("\n");

  return `${[
    "# Phase 2 Traceability Coverage Report",
    "",
    "> Scope: non-mutating coverage evidence for `TC-TRAC-001` and `TC-TRAC-005`.",
    "> This report reads frozen specs and trace files; it does not edit Phase 1 contracts.",
    "",
    "## Summary",
    "",
    markdownTable(["Metric", "Value"], summaryRows),
    "",
    "## Requirement Coverage",
    "",
    markdownTable(
      [
        "Requirement",
        "Priority",
        "Spec",
        "Test matrix",
        "Traceability",
        "Trace status evidence",
        "Test evidence",
        "Implementation evidence",
      ],
      requirementRows,
    ),
    "",
    "## Export Non-Goals",
    "",
    markdownTable(["Claim", "Acceptance status"], nonGoalRows),
    "",
    "## Trace Scope Evidence",
    "",
    `- Stage A status: ${report.traceScope.stageAStatus ?? "missing"}`,
    `- Stage B status: ${report.traceScope.stageBStatus ?? "missing"}`,
    `- Deferred WIP files: ${joinOrDash(report.traceScope.deferredWipFiles)}`,
    `- Deferred WIP markers: ${joinOrDash(
      report.traceScope.deferredItems.map(
        (item) => `${item.file} -> ${item.marker}`,
      ),
    )}`,
    `- Missing status evidence paths: ${joinOrDash(
      report.traceScope.statusEvidencePathsMissing,
    )}`,
    "",
    "## Findings",
    "",
    findings,
  ].join("\n")}\n`;
}

function readCurrentPhase(repoRoot: string): string {
  const status = readRelative(repoRoot, "STATUS.yaml");
  const match = status.match(/^current_phase:\s*"?([^"\n]+)"?/m);
  return match?.[1] ?? "2";
}

function readRelative(repoRoot: string, file: string): string {
  const absolute = path.join(repoRoot, file);
  return existsSync(absolute) ? readFileSync(absolute, "utf8") : "";
}

function walkFiles(repoRoot: string, target: string): string[] {
  const absolute = path.join(repoRoot, target);
  if (!existsSync(absolute)) {
    return [];
  }

  const stats = statSync(absolute);
  if (stats.isFile()) {
    return [toRepoPath(path.relative(repoRoot, absolute))];
  }

  const files: string[] = [];
  for (const entry of readdirSync(absolute)) {
    if (
      target === "." &&
      [
        "node_modules",
        ".git",
        "tmp",
        "playwright-report",
        "test-results",
      ].includes(entry)
    ) {
      continue;
    }

    const child = path.join(absolute, entry);
    const childRelative = path.relative(repoRoot, child);
    const childStats = statSync(child);
    if (childStats.isDirectory()) {
      files.push(...walkFiles(repoRoot, toRepoPath(childRelative)));
    } else {
      files.push(toRepoPath(childRelative));
    }
  }
  return files;
}

function extractRequirementBlocks(
  file: string,
  markdown: string,
): RequirementBlock[] {
  const blocks = markdown.split(/\n(?=- \*\*ID\*\*: )/g);
  const requirements: RequirementBlock[] = [];

  for (const block of blocks) {
    const id = block.match(/^- \*\*ID\*\*:\s*([A-Z]+-[0-9]+)/m)?.[1];
    if (!id || id.startsWith("FC-")) {
      continue;
    }

    requirements.push({
      file,
      id,
      priority:
        block.match(/^- \*\*Priority\*\*:\s*([^\n]+)/m)?.[1]?.trim() ?? null,
    });
  }

  return requirements;
}

function extractTestMatrixRows(markdown: string): TestMatrixRow[] {
  return extractTableRows(markdown)
    .filter((row) => TEST_ID_EXACT_PATTERN.test(row[0] ?? ""))
    .map((row) => ({
      requirementIds: extractIds(row[2] ?? "", REQUIREMENT_ID_PATTERN),
      scenario: row[3] ?? "",
      testId: row[0],
    }));
}

function extractTraceabilityRows(markdown: string): TraceabilityRow[] {
  return extractTableRows(markdown)
    .filter((row) => REQUIREMENT_ID_EXACT_PATTERN.test(row[0] ?? ""))
    .map((row) => ({
      evidencePaths: extractInlineCode(row[2] ?? ""),
      requirementId: row[0],
      testIds: extractIds(row[1] ?? "", TEST_ID_PATTERN),
    }));
}

function extractTableRows(markdown: string): string[][] {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|"))
    .filter((line) => !/^\|\s*:?-{2,}/.test(line.trim()))
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim()),
    );
}

function extractIds(text: string, pattern: RegExp): string[] {
  pattern.lastIndex = 0;
  return uniqueSorted([...text.matchAll(pattern)].map((match) => match[0]));
}

function extractInlineCode(text: string): string[] {
  return uniqueSorted(
    [...text.matchAll(/`([^`]+)`/g)].map((match) => match[1]),
  );
}

function extractStatusEvidencePaths(traceStatus: string): string[] {
  return uniqueSorted(
    traceStatus
      .split(/\r?\n/)
      .map((line) => line.match(/^\s+-\s+(.+)$/)?.[1]?.trim())
      .filter((value): value is string => Boolean(value))
      .filter((value) => PATH_LIKE_PATTERN.test(value)),
  );
}

function extractRequirementEvidenceFromStatus(
  traceStatus: string,
  statusEvidencePaths: string[],
): Map<string, string[]> {
  const evidenceByRequirement = new Map<string, string[]>();
  const lines = traceStatus.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const requirements = extractIds(lines[index] ?? "", REQUIREMENT_ID_PATTERN);
    if (requirements.length === 0) {
      continue;
    }

    const nearbyText = lines.slice(index, index + 28).join("\n");
    const nearbyPaths = statusEvidencePaths.filter((file) =>
      nearbyText.includes(file),
    );

    for (const requirement of requirements) {
      evidenceByRequirement.set(
        requirement,
        uniqueSorted([
          ...(evidenceByRequirement.get(requirement) ?? []),
          ...nearbyPaths,
        ]),
      );
    }
  }

  return evidenceByRequirement;
}

function filesContainingAny(
  repoRoot: string,
  files: string[],
  needles: string[],
): string[] {
  return files.filter((file) => {
    const text = readRelative(repoRoot, file);
    return needles.some((needle) => text.includes(needle));
  });
}

function createFindings(
  requirements: TraceabilityRequirementCoverage[],
): string[] {
  const findings = requirements.flatMap((requirement) => {
    const findings: string[] = [];

    if (!requirement.inSpec) {
      findings.push(`${requirement.id} is missing from domain specs.`);
    }
    if (requirement.matrixTestIds.length === 0) {
      findings.push(`${requirement.id} is missing from SPEC_TEST_MATRIX.md.`);
    }
    if (requirement.traceabilityTestIds.length === 0) {
      findings.push(`${requirement.id} is missing from SPEC_TRACEABILITY.md.`);
    }
    if (
      requirement.traceStatusEvidenceFiles.length === 0 &&
      requirement.testEvidenceFiles.length === 0 &&
      requirement.implementationEvidenceFiles.length === 0
    ) {
      findings.push(
        `${requirement.id} lacks current trace, test, or implementation evidence.`,
      );
    }

    return findings;
  });

  for (const requiredId of TRACEABILITY_COVERAGE_REQUIREMENTS) {
    if (!requirements.some((requirement) => requirement.id === requiredId)) {
      findings.push(
        `${requiredId} is missing from the traceability coverage report.`,
      );
    }
  }

  return findings;
}

function createNonGoalEvidence(
  testRows: TestMatrixRow[],
): TraceabilityCoverageReport["nonGoals"] {
  const rows = testRows.map((row) => row.scenario.toLowerCase());
  return ["MP4 export", "PDF export", "hosted rendering"].map((claim) => ({
    acceptanceScenarioPresent: rows.some(
      (scenario) =>
        scenario.includes(claim.toLowerCase()) &&
        !scenario.includes("must not") &&
        !scenario.includes("do not") &&
        !scenario.includes("without"),
    ),
    claim,
  }));
}

function extractNestedStatus(text: string, key: string): string | null {
  const pattern = new RegExp(
    `^${key}:\\n(?:  .+\\n)*?  status:\\s*([^\\n]+)`,
    "m",
  );
  return pattern.exec(text)?.[1]?.trim() ?? null;
}

function collectDeferredWipFiles(repoRoot: string): string[] {
  return [
    "TODO.md",
    "wip/architect/phase1-traceability-coverage.md",
    ...walkFiles(repoRoot, "wip/future-support").filter((file) =>
      file.endsWith(".md"),
    ),
  ].filter((file) => existsSync(path.join(repoRoot, file)));
}

function collectDeferredItems(
  repoRoot: string,
): Array<{ file: string; marker: string }> {
  const markerPatterns = [
    "active-phase-only hard gate",
    "Promoted into Phase 2 draft contract",
    "Phase 3",
    "Future support",
  ];

  return collectDeferredWipFiles(repoRoot).flatMap((file) => {
    const text = readRelative(repoRoot, file);
    return markerPatterns
      .filter((marker) => text.includes(marker))
      .map((marker) => ({ file, marker }));
  });
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}

function joinOrDash(values: string[]): string {
  return values.length > 0 ? values.join(", ") : "-";
}

function yesNo(value: boolean): string {
  return value ? "yes" : "no";
}

function markdownTable(headers: string[], rows: string[][]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => ":---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function toRepoPath(file: string): string {
  return file.split(path.sep).join("/");
}

function argValue(args: string[], name: string): string | null {
  const index = args.indexOf(name);
  return index >= 0 ? (args[index + 1] ?? null) : null;
}

function main() {
  const args = process.argv.slice(2);
  const repoRoot = process.cwd();
  const phase = argValue(args, "--phase") ?? readCurrentPhase(repoRoot);
  const output =
    argValue(args, "--output") ??
    `trace/phase${phase}/traceability-coverage.md`;
  const report = createTraceabilityCoverageReport({ phase, repoRoot });
  const markdown = formatTraceabilityCoverageMarkdown(report);

  mkdirSync(path.dirname(path.join(repoRoot, output)), { recursive: true });
  writeFileSync(path.join(repoRoot, output), markdown);
  console.log(`traceability coverage report written to ${output}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
