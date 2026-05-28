import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ciWorkflow = readFileSync(
  join(process.cwd(), ".github/workflows/ci.yml"),
  "utf8",
);

describe("CI Playwright install hygiene", () => {
  it("caches Playwright browser binaries per OS and lockfile", () => {
    expect(ciWorkflow).toContain("name: Cache Playwright browsers");
    expect(ciWorkflow).toContain("uses: actions/cache@v4");
    expect(ciWorkflow).toMatch(
      /key: playwright-\$\{\{ runner\.os \}\}-\$\{\{ hashFiles\('pnpm-lock\.yaml'\) \}\}/,
    );
  });

  it("bounds Chromium install latency and uses the headless shell needed by browser tests", () => {
    expect(ciWorkflow).toContain("timeout-minutes: 10");
    expect(ciWorkflow).toContain("PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT");
    expect(ciWorkflow).toContain(
      "pnpm exec playwright install --with-deps --only-shell chromium",
    );
    expect(ciWorkflow).toContain(
      "pnpm exec playwright install --only-shell chromium",
    );
  });
});
