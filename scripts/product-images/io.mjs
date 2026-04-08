import fs from "node:fs/promises";
import path from "node:path";
import { PIPELINE_DIRS } from "./constants.mjs";

export async function ensurePipelineDirs() {
  await Promise.all(Object.values(PIPELINE_DIRS).map((dir) => fs.mkdir(dir, { recursive: true })));
}

export function batchPath(root, batchId) {
  return path.join(root, batchId);
}

export function outputName(sku, kind, index = 0) {
  if (kind === "hero") {
    return `${sku}__hero.png`;
  }

  return `${sku}__alt-${index}.png`;
}

function extensionFromPath(source) {
  const parsed = path.parse(source);
  return parsed.ext || ".bin";
}

function extensionFromContentType(contentType) {
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("jpeg")) return ".jpg";
  if (contentType?.includes("webp")) return ".webp";
  return ".bin";
}

export async function stagePathSource(sourcePath, destinationDir, sourceIndex) {
  const extension = extensionFromPath(sourcePath);
  const stagedPath = path.join(destinationDir, `source-${sourceIndex}${extension}`);
  await fs.copyFile(sourcePath, stagedPath);
  return {
    original: sourcePath,
    staged: stagedPath
  };
}

export async function stageUrlSource(sourceUrl, destinationDir, sourceIndex) {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`download-failed:${response.status}:${sourceUrl}`);
  }

  const extension = extensionFromContentType(response.headers.get("content-type"));
  const stagedPath = path.join(destinationDir, `source-${sourceIndex}${extension}`);
  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(stagedPath, Buffer.from(arrayBuffer));

  return {
    original: sourceUrl,
    staged: stagedPath
  };
}
