import {
  PHASE6_EXPORT_SCHEMA_VERSION,
  validateDeckLocal,
} from "@cadenza-dev/export-local";
import { failureResult, successResult, usageError } from "./output.ts";
import type { CommandAdapter } from "./types.ts";

export const validateCommand = {
  name: "validate",
  async run(args, context) {
    let json = args.includes("--json");

    try {
      const options = parseValidateArgs(args);
      json = options.json;
      const result = await validateDeckLocal({
        cwd: context.cwd,
        selector: options.selector,
        workspaceRoot: context.workspaceRoot,
      });

      return successResult({
        human: `Validated ${result.deck.id} (${result.timeline.slideCount} slides, ${result.timeline.totalFrames} frames)\n`,
        json,
        summary: {
          command: "validate",
          deckId: result.deck.id,
          diagnostics: result.diagnostics,
          exitCode: 0,
          repairHints: [],
          schemaVersion: PHASE6_EXPORT_SCHEMA_VERSION,
          selector: result.selector,
          status: "success",
          timeline: result.timeline,
        },
      });
    } catch (error) {
      return failureResult({ command: "validate", error, json });
    }
  },
  summary: "Validate deck metadata, compile, and timeline evidence.",
  usage: "cadenza validate <deck>",
} satisfies CommandAdapter;

type ParsedValidateArgs = {
  json: boolean;
  selector?: string;
};

function parseValidateArgs(args: string[]): ParsedValidateArgs {
  const parsed: ParsedValidateArgs = {
    json: false,
  };

  for (const arg of args) {
    if (arg === "--json") {
      parsed.json = true;
      continue;
    }

    if (arg.startsWith("--")) {
      throw usageError(
        "CLIS_UNKNOWN_OPTION",
        `Unknown validate option "${arg}".`,
        "Run cadenza validate --help for supported options.",
      );
    }

    if (parsed.selector !== undefined) {
      throw usageError(
        "CLIS_TOO_MANY_ARGUMENTS",
        "cadenza validate accepts at most one deck selector.",
        "Pass a single deck selector, config alias, or local module path.",
      );
    }

    parsed.selector = arg;
  }

  return parsed;
}
