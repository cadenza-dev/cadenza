import {
  inspectExportArtifact,
  PHASE6_EXPORT_SCHEMA_VERSION,
} from "@cadenza-dev/export-local";
import { failureResult, successResult, usageError } from "./output.ts";
import type { CommandAdapter } from "./types.ts";

export const inspectCommand = {
  name: "inspect",
  async run(args) {
    let json = args.includes("--json");

    try {
      const options = parseInspectArgs(args);
      json = options.json;
      const result = await inspectExportArtifact({
        inputPath: options.inputPath,
      });

      return successResult({
        human: `Inspected ${result.manifestPath}\nDeck: ${result.deck.id}\nFormats: ${result.formats.join(", ")}\n`,
        json,
        summary: {
          artifactCount: result.artifacts.length,
          capabilities: result.capabilities,
          command: "inspect",
          deckId: result.deck.id,
          diagnostics: result.diagnostics,
          evidenceFormats: Object.keys(result.evidence).sort(),
          exitCode: 0,
          formats: result.formats,
          knownLimitations: result.knownLimitations,
          manifestPath: result.manifestPath,
          outputDirectory: result.outputDirectory,
          repairHints: [],
          schemaVersion: PHASE6_EXPORT_SCHEMA_VERSION,
          status: "success",
        },
      });
    } catch (error) {
      return failureResult({ command: "inspect", error, json });
    }
  },
  summary: "Inspect an existing Cadenza export manifest or artifact directory.",
  usage: "cadenza inspect <manifest-or-directory>",
} satisfies CommandAdapter;

type ParsedInspectArgs = {
  inputPath: string;
  json: boolean;
};

function parseInspectArgs(args: string[]): ParsedInspectArgs {
  let inputPath: string | undefined;
  let json = false;

  for (const arg of args) {
    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg.startsWith("--")) {
      throw usageError(
        "CLIS_UNKNOWN_OPTION",
        `Unknown inspect option "${arg}".`,
        "Run cadenza inspect --help for supported options.",
      );
    }

    if (inputPath !== undefined) {
      throw usageError(
        "CLIS_TOO_MANY_ARGUMENTS",
        "cadenza inspect accepts exactly one manifest path or artifact directory.",
        "Pass a single manifest.json path or generated artifact directory.",
      );
    }

    inputPath = arg;
  }

  if (inputPath === undefined) {
    throw usageError(
      "CLIS_MISSING_INPUT",
      "cadenza inspect requires a manifest path or artifact directory.",
      "Pass a generated artifact directory or manifest.json path.",
    );
  }

  return {
    inputPath,
    json,
  };
}
