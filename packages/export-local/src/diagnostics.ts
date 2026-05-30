export type Phase6DiagnosticCategory =
  | "config"
  | "deck-loading"
  | "environment"
  | "export"
  | "internal"
  | "usage";

export type Phase6DiagnosticSeverity = "error" | "info" | "warning";

export type Phase6Diagnostic = {
  category: Phase6DiagnosticCategory;
  code: string;
  locator?: string;
  message: string;
  relatedRequirements: string[];
  repairHint: string;
  severity: Phase6DiagnosticSeverity;
};

export class CadenzaPhase6Error extends Error {
  readonly diagnostics: Phase6Diagnostic[];
  readonly exitCode: number;

  constructor(exitCode: number, diagnostics: Phase6Diagnostic[]) {
    super(diagnostics.map((diagnostic) => diagnostic.message).join("\n"));
    this.name = "CadenzaPhase6Error";
    this.exitCode = exitCode;
    this.diagnostics = diagnostics;
  }
}

export function phase6Error(
  exitCode: number,
  diagnostic: Phase6Diagnostic,
): CadenzaPhase6Error {
  return new CadenzaPhase6Error(exitCode, [diagnostic]);
}
