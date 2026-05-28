import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ciWorkflow = readFileSync(
  join(process.cwd(), ".github/workflows/ci.yml"),
  "utf8",
);
const playwrightConfig = readFileSync(
  join(process.cwd(), "playwright.config.ts"),
  "utf8",
);

describe("CI Playwright browser provisioning hygiene", () => {
  it("keeps hosted browser jobs off Playwright installer downloads", () => {
    expect(ciWorkflow).not.toContain("pnpm exec playwright install");
    expect(ciWorkflow).toContain("CADENZA_PLAYWRIGHT_CHANNEL: chrome");
  });

  it("lets CI select the preinstalled Chrome channel without changing local defaults", () => {
    expect(playwrightConfig).toContain("CADENZA_PLAYWRIGHT_CHANNEL");
    expect(playwrightConfig).toContain('channel: "chrome"');
  });
});
