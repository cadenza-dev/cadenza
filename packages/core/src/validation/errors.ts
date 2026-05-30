import type { CadenzaDiagnostic } from "../diagnostics/types.ts";

export class CadenzaValidationError extends Error {
  readonly diagnostics: CadenzaDiagnostic[];

  constructor(diagnostics: CadenzaDiagnostic[]) {
    super("Cadenza validation failed.");
    this.name = "CadenzaValidationError";
    this.diagnostics = diagnostics;
  }
}
