import { renderHelp } from "./commands/help.ts";
import { commandRegistry, getCommand } from "./commands/registry.ts";
import type { CommandResult } from "./commands/types.ts";

export type {
  CommandAdapter,
  CommandContext,
  CommandResult,
} from "./commands/types.ts";
export { defineConfig } from "./config.ts";
export { commandRegistry, getCommand };

const CLI_VERSION = "0.0.0";

export async function runPhase6Cli(
  args: string[],
  cwd: string,
  workspaceRoot = cwd,
): Promise<CommandResult> {
  const [first, ...rest] = args;

  if (
    first === undefined ||
    first === "--help" ||
    first === "-h" ||
    first === "help"
  ) {
    return {
      exitCode: 0,
      stderr: "",
      stdout: renderHelp(commandRegistry),
    };
  }

  if (first === "--version" || first === "-v" || first === "version") {
    return {
      exitCode: 0,
      stderr: "",
      stdout: `cadenza ${CLI_VERSION}\n`,
    };
  }

  const command = getCommand(first);
  if (command === undefined) {
    return {
      exitCode: 2,
      stderr: `Unknown cadenza command "${first}". Run "cadenza --help".\n`,
      stdout: "",
    };
  }

  return command.run(rest, { cwd, workspaceRoot });
}

export async function runPhase6CliEntrypoint(args: string[]): Promise<number> {
  const result = await runPhase6Cli(args, process.cwd());
  if (result.stdout !== "") {
    process.stdout.write(result.stdout);
  }
  if (result.stderr !== "") {
    process.stderr.write(result.stderr);
  }
  return result.exitCode;
}
