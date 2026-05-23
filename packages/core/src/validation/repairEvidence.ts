export type Phase3RepairEvidence = {
  schemaVersion: 1;
  acceptanceEvidenceKind: string;
  scenarioIds: string[];
  authoredDeckPath: string;
  repairedDeckPath: string;
  commands: string[];
  before: {
    deckVariant: string;
    previewPass: boolean;
    previewDiagnostics: unknown[];
    repairQueue: unknown[];
  };
  after: {
    deckVariant: string;
    previewPass: boolean;
    previewDiagnostics: unknown[];
  };
  repairScope: {
    allowedEdits: string[];
    authoringGuidanceEdits: string[];
    frameworkInternalEdits: string[];
  };
  traceDeclarationOnly: boolean;
};

export type Phase3RepairEvidenceFinding = {
  code: string;
  message: string;
  requirementId: string;
  severity: "warning";
  source: string;
  testRefs: string[];
};

export function validatePhase3RepairEvidence(
  evidence: Phase3RepairEvidence,
): Phase3RepairEvidenceFinding[] {
  const findings: Phase3RepairEvidenceFinding[] = [];
  const repairPaths = [
    evidence.authoredDeckPath,
    evidence.repairedDeckPath,
    ...evidence.repairScope.allowedEdits,
  ];

  for (const repairPath of repairPaths) {
    if (isPackageSourcePath(repairPath)) {
      findings.push({
        code: "AUTH_PACKAGE_SRC_REPAIR_SCOPE",
        message:
          "Phase 3 repair evidence must keep authored deck repairs outside packages/**/src/**.",
        requirementId: "AUTH-001",
        severity: "warning",
        source: repairPath,
        testRefs: ["TC-AUTH-004"],
      });
    }
  }

  if (evidence.traceDeclarationOnly) {
    findings.push({
      code: "DIAG_TRACE_ONLY_DECLARATION",
      message:
        "Trace declarations alone do not satisfy Phase 3 repair scenarios without compile, preview, test, or implementation proof.",
      requirementId: "DIAG-003",
      severity: "warning",
      source: evidence.acceptanceEvidenceKind,
      testRefs: ["TC-DIAG-003"],
    });
  }

  return findings;
}

function isPackageSourcePath(repairPath: string): boolean {
  return /^packages\/[^/]+\/src\//.test(repairPath);
}
