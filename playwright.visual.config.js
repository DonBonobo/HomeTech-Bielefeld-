const path = require("path");
const { defineConfig } = require("@playwright/test");

const artifactRoot = path.join(__dirname, "artifacts", "playwright");

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
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "off",
    video: "off",
  },
  webServer: {
    command: "npm run start -- --hostname 0.0.0.0 --port 3100",
    url: "http://127.0.0.1:3100",
    timeout: 120_000,
    reuseExistingServer: false,
  },
});
