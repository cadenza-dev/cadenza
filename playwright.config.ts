import { defineConfig, devices } from "@playwright/test";

const cadenzaPlaywrightChannel = process.env.CADENZA_PLAYWRIGHT_CHANNEL;

export default defineConfig({
  fullyParallel: false,
  reporter: [["list"]],
  testDir: "./tests/browser",
  timeout: 10_000,
  use: {
    ...devices["Desktop Chrome"],
    browserName: "chromium",
    ...(cadenzaPlaywrightChannel === "chrome"
      ? { channel: "chrome" as const }
      : {}),
    headless: true,
    viewport: { height: 720, width: 1280 },
  },
});
