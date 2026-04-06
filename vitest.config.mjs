import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.js"],
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "."),
    },
  },
});
