import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  fullyParallel: false,
  reporter: [["list"]],
  testDir: "./tests/browser",
  timeout: 10_000,
  use: {
    ...devices["Desktop Chrome"],
    browserName: "chromium",
    headless: true,
    viewport: { height: 720, width: 1280 },
  },
});
