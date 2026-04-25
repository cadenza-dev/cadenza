export type DiagnosticSeverity = "fatal" | "warning";

export type CadenzaDiagnostic = {
  severity: DiagnosticSeverity;
  code: string;
  message: string;
  requirementId: string;
  source?: string;
};
