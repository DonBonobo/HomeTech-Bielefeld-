import { execSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const artifactRoot = path.join(root, "artifacts", "playwright");
const isCi = process.argv.includes("--ci");

rmSync(artifactRoot, { recursive: true, force: true });
mkdirSync(path.join(artifactRoot, "screenshots", "mobile"), { recursive: true });
mkdirSync(path.join(artifactRoot, "screenshots", "desktop"), { recursive: true });
mkdirSync(path.join(artifactRoot, "traces"), { recursive: true });
mkdirSync(path.join(artifactRoot, "report"), { recursive: true });

try {
  execSync("pkill -f 'next start --hostname 0.0.0.0 --port 3000'", { stdio: "ignore", cwd: root });
} catch {}

execSync("npm run build", { stdio: "inherit", cwd: root });
execSync("npx playwright test --config=playwright.visual.config.js", {
  stdio: "inherit",
  cwd: root,
  env: {
    ...process.env,
    CI: isCi ? "true" : process.env.CI,
  },
});
execSync("node scripts/map-visual-references.mjs", { stdio: "inherit", cwd: root });

console.log("\nVisual artifacts written to:");
console.log(`- ${path.join(artifactRoot, "screenshots", "mobile")}`);
console.log(`- ${path.join(artifactRoot, "screenshots", "desktop")}`);
console.log(`- ${path.join(artifactRoot, "screenshots", "manifest.json")}`);
console.log(`- ${path.join(artifactRoot, "comparison-manifest.json")}`);
console.log(`- ${path.join(artifactRoot, "traces")}`);
console.log(`- ${path.join(artifactRoot, "report")}`);
