import {
  CadenzaPhase6Error,
  PHASE6_EXIT_CODES,
  type Phase6Diagnostic,
} from "@cadenza-dev/export-local";
import type { CommandResult } from "./types.ts";

export type CommandSummary = {
  command: string;
  diagnostics: Phase6Diagnostic[];
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
  const phase6Error = toPhase6Error(error);
  const summary: CommandSummary = {
    command,
    diagnostics: phase6Error.diagnostics,
    exitCode: phase6Error.exitCode,
    repairHints: phase6Error.diagnostics.map(
      (diagnostic) => diagnostic.repairHint,
    ),
    schemaVersion: 1,
    status: "failure",
  };

  if (json) {
    return {
      exitCode: phase6Error.exitCode,
      stderr: "",
      stdout: `${JSON.stringify(summary, null, 2)}\n`,
    };
  }

  return {
    exitCode: phase6Error.exitCode,
    stderr: `${phase6Error.diagnostics
      .map((diagnostic) => `${diagnostic.code}: ${diagnostic.message}`)
      .join("\n")}\n`,
    stdout: "",
  };
}

export function usageError(
  code: string,
  message: string,
  repairHint: string,
): CadenzaPhase6Error {
  return new CadenzaPhase6Error(PHASE6_EXIT_CODES.usage, [
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

function toPhase6Error(error: unknown): CadenzaPhase6Error {
  if (error instanceof CadenzaPhase6Error) {
    return error;
  }

  return new CadenzaPhase6Error(PHASE6_EXIT_CODES.internal, [
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
