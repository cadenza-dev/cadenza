import type { CommandAdapter } from "./types.ts";

export const inspectCommand = {
  name: "inspect",
  async run() {
    return {
      exitCode: 2,
      stderr:
        "The inspect command is registered; artifact inspection is implemented in the B6.2 batch.\n",
      stdout: "",
    };
  },
  summary: "Inspect an existing Cadenza export manifest or artifact directory.",
  usage: "cadenza inspect <manifest-or-directory>",
} satisfies CommandAdapter;
