const path = require("path");
const { defineConfig } = require("@playwright/test");

const artifactRoot = path.join(__dirname, "artifacts", "playwright");
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100";
const useExternalBaseUrl = Boolean(process.env.PLAYWRIGHT_BASE_URL);

module.exports = defineConfig({
  testDir: path.join(__dirname, "tests", "playwright"),
  testMatch: /.*\.visual\.js/,
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: path.join(artifactRoot, "report"), open: "never" }],
  ],
  outputDir: path.join(artifactRoot, "traces"),
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "off",
    video: "off",
  },
  webServer: useExternalBaseUrl ? undefined : {
    command: "npm run start -- --hostname 0.0.0.0 --port 3100",
    url: "http://127.0.0.1:3100",
    timeout: 120_000,
    reuseExistingServer: false,
  },
});
