import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@cadenza-dev/core/fixtures/allDomainMvp",
        replacement: path.join(
          rootDir,
          "packages/core/src/fixtures/allDomainMvp.ts",
        ),
      },
      {
        find: "@cadenza-dev/core",
        replacement: path.join(rootDir, "packages/core/src/index.ts"),
      },
      {
        find: "@cadenza-dev/preview-remotion",
        replacement: path.join(
          rootDir,
          "packages/preview-remotion/src/index.ts",
        ),
      },
    ],
  },
  test: {
    include: ["packages/**/*.test.ts", "scripts/**/*.test.ts"],
    passWithNoTests: true,
  },
});
