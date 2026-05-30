import { exportCommand } from "./export.ts";
import { inspectCommand } from "./inspect.ts";
import type { CommandAdapter } from "./types.ts";
import { validateCommand } from "./validate.ts";

export const commandRegistry = [
  exportCommand,
  validateCommand,
  inspectCommand,
] satisfies CommandAdapter[];

export function getCommand(name: string): CommandAdapter | undefined {
  return commandRegistry.find((command) => command.name === name);
}
