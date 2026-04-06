import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const artifactsRoot = path.join(projectRoot, "artifacts", "playwright");
const externalRoot = "/storage/emulated/0/DCIM/🤖HomeTech🤘Bielefeld🌆";

function listFiles(dir) {
  try {
    return readdirSync(dir).sort();
  } catch {
    return [];
  }
}

const payload = {
  generatedAt: new Date().toISOString(),
  screenshotsRoot: path.join(artifactsRoot, "screenshots"),
  currentState: {
    root: path.join(externalRoot, "CurrentState"),
    files: listFiles(path.join(externalRoot, "CurrentState")),
  },
  wireframes: {
    root: path.join(externalRoot, "Pics", "Wireframes"),
    files: listFiles(path.join(externalRoot, "Pics", "Wireframes")),
  },
  notes: [
    "Vergleiche zuerst mobile screenshots mit CurrentState.",
    "Nutze die Wireframes als Zielstruktur, nicht als Pixel-Match.",
  ],
};

const referenceDir = path.join(artifactsRoot, "reference", "current-state");
mkdirSync(referenceDir, { recursive: true });
for (const file of payload.currentState.files.slice(-3)) {
  copyFileSync(
    path.join(payload.currentState.root, file),
    path.join(referenceDir, file)
  );
}

writeFileSync(
  path.join(artifactsRoot, "comparison-manifest.json"),
  JSON.stringify(payload, null, 2)
);

console.log(`Comparison manifest written to ${path.join(artifactsRoot, "comparison-manifest.json")}`);
