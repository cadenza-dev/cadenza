import type { CommandAdapter, CommandContext, CommandResult } from "./types.ts";

export function renderHelp(commands: readonly CommandAdapter[]): string {
  const commandLines = commands
    .map((command) => `  ${command.name.padEnd(9)} ${command.summary}`)
    .join("\n");

  return `Usage: cadenza <command> [options]

Local CLI for trusted Cadenza deck modules.

Commands:
${commandLines}

Global options:
  --help       Show this help.
  --version    Print the local CLI version.

Formats: web, mp4
`;
}

export async function runHelpCommand(
  commands: readonly CommandAdapter[],
  _args: string[],
  _context: CommandContext,
): Promise<CommandResult> {
  return {
    exitCode: 0,
    stderr: "",
    stdout: renderHelp(commands),
  };
}
