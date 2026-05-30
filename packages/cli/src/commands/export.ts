import type { CommandAdapter } from "./types.ts";

export const exportCommand = {
  name: "export",
  async run() {
    return {
      exitCode: 2,
      stderr:
        "The export command is registered; export execution is implemented in the B6.2 batch.\n",
      stdout: "",
    };
  },
  summary: "Export a trusted local deck module.",
  usage: "cadenza export <deck> [--format web,mp4] [--output <dir>]",
} satisfies CommandAdapter;
