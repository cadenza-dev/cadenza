import {
  exportDeckLocal,
  LOCAL_EXPORT_SCHEMA_VERSION,
} from "@cadenza-dev/export-local";
import { failureResult, successResult, usageError } from "./output.ts";
import { parseFormats, readFlagValue } from "./parse.ts";
import type { CommandAdapter } from "./types.ts";

export const exportCommand = {
  name: "export",
  async run(args, context) {
    let json = args.includes("--json");

    try {
      const options = parseExportArgs(args);
      json = options.json;
      const result = await exportDeckLocal({
        cwd: context.cwd,
        force: options.force,
        formats: options.formats,
        outputRoot: options.outputRoot,
        runId: options.runId,
        selector: options.selector,
        workspaceRoot: context.workspaceRoot,
      });

      return successResult({
        human: `Exported ${result.manifest.deck.id} to ${result.outputDirectory}\nManifest: ${result.manifestPath}\n`,
        json,
        summary: {
          command: "export",
          deckId: result.manifest.deck.id,
          diagnostics: [],
          evidencePaths: result.evidencePaths,
          exitCode: 0,
          manifestPath: result.manifestPath,
          outputDirectory: result.outputDirectory,
          repairHints: [],
          schemaVersion: LOCAL_EXPORT_SCHEMA_VERSION,
          stableHash: result.manifest.stableHash,
          status: "success",
        },
      });
    } catch (error) {
      return failureResult({ command: "export", error, json });
    }
  },
  summary: "Export a trusted local deck module.",
  usage: "cadenza export <deck> [--format web,mp4] [--output <dir>]",
} satisfies CommandAdapter;

type ParsedExportArgs = {
  force: boolean;
  formats?: ReturnType<typeof parseFormats>;
  json: boolean;
  outputRoot?: string;
  runId?: string;
  selector?: string;
};

function parseExportArgs(args: string[]): ParsedExportArgs {
  const parsed: ParsedExportArgs = {
    force: false,
    json: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--json") {
      parsed.json = true;
      continue;
    }

    if (arg === "--force") {
      parsed.force = true;
      continue;
    }

    if (arg === "--format") {
      parsed.formats = [
        ...(parsed.formats ?? []),
        ...parseFormats(readFlagValue(args, index, arg)),
      ];
      index += 1;
      continue;
    }

    if (arg === "--output" || arg === "--output-root") {
      parsed.outputRoot = readFlagValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--run-id") {
      parsed.runId = readFlagValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg.startsWith("--")) {
      throw usageError(
        "CLIS_UNKNOWN_OPTION",
        `Unknown export option "${arg}".`,
        "Run cadenza export --help for supported options.",
      );
    }

    if (parsed.selector !== undefined) {
      throw usageError(
        "CLIS_TOO_MANY_ARGUMENTS",
        "cadenza export accepts at most one deck selector.",
        "Pass a single deck selector, config alias, or local module path.",
      );
    }

    parsed.selector = arg;
  }

  return parsed;
}
