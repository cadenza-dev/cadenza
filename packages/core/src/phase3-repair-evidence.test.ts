import { readFileSync } from "node:fs";
import path from "node:path";
import {
  type Phase3RepairEvidence,
  validatePhase3RepairEvidence,
} from "@cadenza-dev/core";
import { describe, expect, it } from "vitest";

const phase3AuthoredDeckPath = "examples/phase3/acceptance-deck.tsx";

describe("Phase 3 repair evidence remediation", () => {
  it("REV-P3-001 keeps authored repair paths outside packages source", () => {
    const evidence = readPhase3RepairEvidence();
    const repairPaths = [
      evidence.authoredDeckPath,
      evidence.repairedDeckPath,
      ...evidence.repairScope.allowedEdits,
    ];

    expect(evidence.authoredDeckPath).toBe(phase3AuthoredDeckPath);
    expect(evidence.repairedDeckPath).toBe(phase3AuthoredDeckPath);
    expect(evidence.repairScope.allowedEdits).toEqual([phase3AuthoredDeckPath]);
    expect(repairPaths.some(isPackageSourcePath)).toBe(false);
    expect(validatePhase3RepairEvidence(evidence)).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "AUTH_PACKAGE_SRC_REPAIR_SCOPE",
          requirementId: "AUTH-001",
        }),
      ]),
    );
  });

  it("REV-P3-002 keeps trace-only declarations as findings until real evidence exists", () => {
    const evidence = readPhase3RepairEvidence();
    const traceOnlyEvidence: Phase3RepairEvidence = {
      ...evidence,
      acceptanceEvidenceKind: "trace-declaration",
      before: {
        ...evidence.before,
        previewDiagnostics: [],
        repairQueue: [],
      },
      after: {
        ...evidence.after,
        previewPass: false,
        previewDiagnostics: [],
      },
      traceDeclarationOnly: true,
    };

    expect(validatePhase3RepairEvidence(traceOnlyEvidence)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "DIAG_TRACE_ONLY_DECLARATION",
          requirementId: "DIAG-003",
          testRefs: ["TC-DIAG-003"],
        }),
      ]),
    );
    expect(validatePhase3RepairEvidence(evidence)).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "DIAG_TRACE_ONLY_DECLARATION",
          requirementId: "DIAG-003",
        }),
      ]),
    );
  });
});

function readPhase3RepairEvidence(): Phase3RepairEvidence {
  return JSON.parse(
    readFileSync(
      path.join(
        process.cwd(),
        "trace/phase3/evidence/b3.2-repair-evidence.json",
      ),
      "utf8",
    ),
  );
}

function isPackageSourcePath(repairPath: string): boolean {
  return /^packages\/[^/]+\/src\//.test(repairPath);
}
