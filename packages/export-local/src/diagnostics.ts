export type LocalExportDiagnosticCategory =
  | "config"
  | "deck-loading"
  | "environment"
  | "export"
  | "inspect"
  | "internal"
  | "renderer"
  | "usage"
  | "validation";

export const LOCAL_EXPORT_EXIT_CODES = {
  deckValidation: 3,
  environment: 5,
  export: 4,
  internal: 70,
  success: 0,
  usage: 2,
} as const;

export type LocalExportDiagnosticSeverity = "error" | "info" | "warning";

export type LocalExportDiagnostic = {
  category: LocalExportDiagnosticCategory;
  code: string;
  locator?: string;
  message: string;
  rendererStage?: string;
  relatedRequirements: string[];
  repairHint: string;
  severity: LocalExportDiagnosticSeverity;
};

export class CadenzaLocalExportError extends Error {
  readonly diagnostics: LocalExportDiagnostic[];
  readonly exitCode: number;

  constructor(exitCode: number, diagnostics: LocalExportDiagnostic[]) {
    super(diagnostics.map((diagnostic) => diagnostic.message).join("\n"));
    this.name = "CadenzaLocalExportError";
    this.exitCode = exitCode;
    this.diagnostics = diagnostics;
  }
}

export function localExportError(
  exitCode: number,
  diagnostic: LocalExportDiagnostic,
): CadenzaLocalExportError {
  return new CadenzaLocalExportError(exitCode, [diagnostic]);
}
