import {
  CadenzaLocalExportError,
  LOCAL_EXPORT_EXIT_CODES,
  type LocalExportDiagnostic,
} from "@cadenza-dev/export-local";
import type { CommandResult } from "./types.ts";

export type CommandSummary = {
  command: string;
  diagnostics: LocalExportDiagnostic[];
  exitCode: number;
  repairHints: string[];
  schemaVersion: number;
  status: "failure" | "success";
} & Record<string, unknown>;

export function successResult({
  human,
  json,
  summary,
}: {
  human: string;
  json: boolean;
  summary: CommandSummary;
}): CommandResult {
  if (json) {
    return {
      exitCode: summary.exitCode,
      stderr: "",
      stdout: `${JSON.stringify(summary, null, 2)}\n`,
    };
  }

  return {
    exitCode: summary.exitCode,
    stderr: "",
    stdout: human,
  };
}

export function failureResult({
  command,
  error,
  json,
}: {
  command: string;
  error: unknown;
  json: boolean;
}): CommandResult {
  const localExportError = toLocalExportError(error);
  const summary: CommandSummary = {
    command,
    diagnostics: localExportError.diagnostics,
    exitCode: localExportError.exitCode,
    repairHints: localExportError.diagnostics.map(
      (diagnostic) => diagnostic.repairHint,
    ),
    schemaVersion: 1,
    status: "failure",
  };

  if (json) {
    return {
      exitCode: localExportError.exitCode,
      stderr: "",
      stdout: `${JSON.stringify(summary, null, 2)}\n`,
    };
  }

  return {
    exitCode: localExportError.exitCode,
    stderr: `${localExportError.diagnostics
      .map((diagnostic) => `${diagnostic.code}: ${diagnostic.message}`)
      .join("\n")}\n`,
    stdout: "",
  };
}

export function usageError(
  code: string,
  message: string,
  repairHint: string,
): CadenzaLocalExportError {
  return new CadenzaLocalExportError(LOCAL_EXPORT_EXIT_CODES.usage, [
    {
      category: "usage",
      code,
      message,
      relatedRequirements: ["CLIS-002", "CLIS-007", "CLIS-008"],
      repairHint,
      severity: "error",
    },
  ]);
}

function toLocalExportError(error: unknown): CadenzaLocalExportError {
  if (error instanceof CadenzaLocalExportError) {
    return error;
  }

  return new CadenzaLocalExportError(LOCAL_EXPORT_EXIT_CODES.internal, [
    {
      category: "internal",
      code: "CDIA_INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Unexpected failure.",
      relatedRequirements: ["CDIA-007"],
      repairHint:
        "Re-run the command with the same inputs and preserve the generated evidence for maintainer review.",
      severity: "error",
    },
  ]);
}
