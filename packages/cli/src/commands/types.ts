export type CommandContext = {
  cwd: string;
};

export type CommandResult = {
  exitCode: number;
  stderr: string;
  stdout: string;
};

export type CommandAdapter = {
  name: string;
  summary: string;
  usage: string;
  run: (args: string[], context: CommandContext) => Promise<CommandResult>;
};
