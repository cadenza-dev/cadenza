import type { CommandAdapter } from "./types.ts";

export const validateCommand = {
  name: "validate",
  async run() {
    return {
      exitCode: 2,
      stderr:
        "The validate command is registered; validation execution is implemented in the B6.2 batch.\n",
      stdout: "",
    };
  },
  summary: "Validate deck metadata, compile, and timeline evidence.",
  usage: "cadenza validate <deck>",
} satisfies CommandAdapter;
