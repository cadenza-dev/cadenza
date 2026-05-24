export type Phase4VisualFindingCategory =
  | "boundary claim"
  | "diagnostics"
  | "layout"
  | "motion"
  | "notes"
  | "presenter workflow"
  | "typography";

export type Phase4VisualEvidenceReference = {
  kind: string;
  source: string;
  summary: string;
};

export type Phase4VisualDiagnostic = {
  code: string;
  message: string;
  requirementRefs: string[];
  severity: "info" | "warning" | "error";
  source: string;
  testRefs: string[];
};

export type Phase4VisualFinding = {
  affected: {
    chapterId?: string;
    slideId?: string;
  };
  after: {
    diagnostics: Phase4VisualDiagnostic[];
    evidence: Phase4VisualEvidenceReference[];
  };
  before: {
    diagnostics: Phase4VisualDiagnostic[];
    evidence: Phase4VisualEvidenceReference[];
  };
  category: Phase4VisualFindingCategory;
  commandsOrRoutes: Array<{
    kind: "command" | "route";
    result: string;
    value: string;
  }>;
  id: string;
  intendedRepairSurface:
    | "authored-deck"
    | "evidence-record"
    | "framework-defect-route"
    | "guidance";
  observedProblem: string;
  repairRouting: {
    allowedEdits: string[];
    frameworkInternalEdits: string[];
    kind: "authored-deck-repair" | "framework-defect-route" | "guidance-repair";
    separateBuilderIssue: null | string;
  };
  requirementRefs: string[];
  testRefs: string[];
};

export type Phase4OptionalVisualArtifact = {
  kind: "pixel-sanity" | "screenshot";
  required: false;
  source: string;
  summary: string;
};

export type Phase4VisualAcceptanceEvidence = {
  acceptanceEvidenceKind: string;
  batchId: "B4.3";
  commands: string[];
  findings: Phase4VisualFinding[];
  maintainerVisualDecision:
    | "explicit-waiver"
    | "pending-closeout-signoff"
    | "signed-off";
  optionalVisualArtifacts: Phase4OptionalVisualArtifact[];
  phase: "4";
  productWorkflowDiagnostics: Phase4VisualDiagnostic[];
  scenarioIds: string[];
  schemaVersion: 1;
  traceDeclarationOnly: boolean;
};

export type Phase4VisualAcceptanceEvidenceFinding = {
  code: string;
  message: string;
  requirementId: string;
  severity: "error" | "warning";
  source: string;
  testRefs: string[];
};

export function validatePhase4VisualAcceptanceEvidence(
  evidence: Phase4VisualAcceptanceEvidence,
): Phase4VisualAcceptanceEvidenceFinding[] {
  const findings: Phase4VisualAcceptanceEvidenceFinding[] = [];
  const hasRealAcceptanceProof =
    evidence.commands.length > 0 ||
    evidence.productWorkflowDiagnostics.length > 0 ||
    evidence.maintainerVisualDecision === "explicit-waiver" ||
    evidence.maintainerVisualDecision === "signed-off";

  if (evidence.traceDeclarationOnly) {
    findings.push({
      code: "VARR_TRACE_ONLY_DECLARATION",
      message:
        "Trace declarations alone do not satisfy Phase 4 visual acceptance without preview, diagnostic, test, sign-off, or waiver proof.",
      requirementId: "VARR-002",
      severity: "warning",
      source: evidence.acceptanceEvidenceKind,
      testRefs: ["TC-VARR-002"],
    });
  }

  if (!hasRealAcceptanceProof) {
    findings.push({
      code: "VARR_ARTIFACT_ONLY_ACCEPTANCE",
      message:
        "Optional screenshots or pixel artifacts may supplement Phase 4 visual acceptance, but cannot replace real acceptance evidence.",
      requirementId: "VARR-006",
      severity: "warning",
      source: evidence.acceptanceEvidenceKind,
      testRefs: ["TC-VARR-002"],
    });
  }

  if (evidence.findings.length === 0) {
    findings.push({
      code: "VARR_FINDING_REQUIRED",
      message:
        "Phase 4 visual acceptance evidence must include at least one structured finding.",
      requirementId: "VARR-001",
      severity: "warning",
      source: evidence.acceptanceEvidenceKind,
      testRefs: ["TC-VARR-001"],
    });
  }

  for (const finding of evidence.findings) {
    const repairPaths = [
      ...finding.repairRouting.allowedEdits,
      ...finding.repairRouting.frameworkInternalEdits,
    ];
    const packageSourceRepairs = repairPaths.filter(isPackageSourcePath);
    const routesFrameworkDefectSeparately =
      finding.repairRouting.kind === "framework-defect-route" &&
      finding.repairRouting.separateBuilderIssue !== null;

    for (const repairPath of packageSourceRepairs) {
      if (!routesFrameworkDefectSeparately) {
        findings.push({
          code: "VARR_PACKAGE_SRC_REPAIR_SCOPE",
          message:
            "Phase 4 visual repairs must not treat packages/**/src/** framework edits as normal dogfood-talk repair.",
          requirementId: "VARR-003",
          severity: "warning",
          source: repairPath,
          testRefs: ["TC-VARR-003"],
        });
      }
    }

    if (
      finding.repairRouting.kind === "framework-defect-route" &&
      finding.repairRouting.separateBuilderIssue === null
    ) {
      findings.push({
        code: "VARR_FRAMEWORK_DEFECT_ROUTE_REQUIRED",
        message:
          "Suspected Phase 4 framework defects must be routed to a separate Builder issue.",
        requirementId: "VARR-003",
        severity: "warning",
        source: finding.id,
        testRefs: ["TC-VARR-003"],
      });
    }

    if (!finding.affected.slideId && !finding.affected.chapterId) {
      findings.push({
        code: "VARR_AFFECTED_TARGET_REQUIRED",
        message:
          "Phase 4 visual findings must name an affected slide or chapter when known.",
        requirementId: "VARR-001",
        severity: "warning",
        source: finding.id,
        testRefs: ["TC-VARR-001"],
      });
    }

    if (
      finding.commandsOrRoutes.length === 0 ||
      finding.before.evidence.length === 0 ||
      finding.after.evidence.length === 0
    ) {
      findings.push({
        code: "VARR_REVIEW_EVIDENCE_REQUIRED",
        message:
          "Phase 4 visual findings must include commands or routes plus before/after evidence.",
        requirementId: "VARR-004",
        severity: "warning",
        source: finding.id,
        testRefs: ["TC-VARR-001"],
      });
    }
  }

  if (evidence.productWorkflowDiagnostics.length === 0) {
    findings.push({
      code: "VARR_PRODUCT_WORKFLOW_DIAGNOSTIC_REQUIRED",
      message:
        "Phase 4 visual evidence must be inspectable through product-layer diagnostics.",
      requirementId: "VARR-005",
      severity: "warning",
      source: evidence.acceptanceEvidenceKind,
      testRefs: ["TC-VARR-001"],
    });
  }

  return findings;
}

export function validatePhase4VisualCloseoutEvidence(
  evidence: Phase4VisualAcceptanceEvidence,
): Phase4VisualAcceptanceEvidenceFinding[] {
  const findings = validatePhase4VisualAcceptanceEvidence(evidence);

  if (evidence.maintainerVisualDecision === "pending-closeout-signoff") {
    findings.push({
      code: "VARR_CLOSEOUT_VISUAL_DECISION_PENDING",
      message:
        "Phase 4 closeout requires maintainer visual sign-off or an explicit maintainer waiver.",
      requirementId: "VARR-002",
      severity: "error",
      source: evidence.acceptanceEvidenceKind,
      testRefs: ["TC-VARR-002"],
    });
  }

  return findings;
}

function isPackageSourcePath(repairPath: string): boolean {
  return /^packages\/[^/]+\/src\//.test(repairPath);
}
