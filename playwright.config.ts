import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/playwright",
  timeout: 60_000,
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "off"
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1400 }
      }
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 412, height: 1200 }
      }
    }
  ]
});
