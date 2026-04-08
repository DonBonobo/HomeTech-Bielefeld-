import fs from "node:fs/promises";
import path from "node:path";
import { PIPELINE_DIRS, DEFAULT_REVIEW_STATUS } from "./constants.mjs";
import { ensurePipelineDirs, batchPath, stagePathSource, stageUrlSource } from "./io.mjs";
import { normalizeSources } from "./normalize.mjs";
import { buildFlaggedEntry, validateBatchItem } from "./rights.mjs";
import { writeReviewPage } from "./review.mjs";

const [, , batchFileArg] = process.argv;

if (!batchFileArg) {
  console.error("Usage: node scripts/product-images/run-pipeline.mjs <batch-file.json>");
  process.exit(1);
}

const batchFilePath = path.resolve(batchFileArg);
const batchFile = JSON.parse(await fs.readFile(batchFilePath, "utf8"));
const batchId = batchFile.batchId ?? path.basename(batchFilePath, path.extname(batchFilePath));
const timestamp = new Date().toISOString();

await ensurePipelineDirs();

const stagingDir = batchPath(PIPELINE_DIRS.staging, batchId);
const exportRoot = batchPath(PIPELINE_DIRS.exports, batchId);
const reviewDir = batchPath(PIPELINE_DIRS.review, batchId);
const manifestPath = path.join(PIPELINE_DIRS.manifests, `${batchId}.json`);

await fs.mkdir(stagingDir, { recursive: true });
await fs.mkdir(exportRoot, { recursive: true });

const entries = [];

for (const item of batchFile.items ?? []) {
  const validation = validateBatchItem(item);
  if (!validation.ok) {
    entries.push(buildFlaggedEntry(item, batchId, timestamp, validation.issues));
    continue;
  }

  const itemStageDir = path.join(stagingDir, item.sku);
  const itemExportDir = path.join(exportRoot, item.sku);
  await fs.mkdir(itemStageDir, { recursive: true });

  const stagedSources = [];

  for (let index = 0; index < (item.sourcePaths?.length ?? 0); index += 1) {
    stagedSources.push(await stagePathSource(item.sourcePaths[index], itemStageDir, index + 1));
  }

  for (let index = 0; index < (item.sourceUrls?.length ?? 0); index += 1) {
    stagedSources.push(await stageUrlSource(item.sourceUrls[index], itemStageDir, stagedSources.length + 1));
  }

  if (!stagedSources.length) {
    entries.push(buildFlaggedEntry(item, batchId, timestamp, ["no-staged-sources"]));
    continue;
  }

  const outputPaths = await normalizeSources({
    sku: item.sku,
    sourceRecords: stagedSources,
    exportDir: itemExportDir,
    processingMode: item.processingMode ?? "normalize"
  });

  entries.push({
    sku: item.sku,
    slug: item.slug ?? item.sku,
    brand: item.brand,
    ean: item.ean ?? null,
    gtin: item.gtin ?? null,
    source_type: item.sourceType,
    source_paths: item.sourcePaths ?? [],
    source_urls: item.sourceUrls ?? [],
    source_path: item.sourcePaths?.[0] ?? null,
    source_url: item.sourceUrls?.[0] ?? null,
    rights_confirmed: item.rightsConfirmed,
    rights_note: item.rightsNote ?? "",
    processing_mode: item.processingMode ?? "normalize",
    batch_id: batchId,
    review_status: item.reviewStatus ?? DEFAULT_REVIEW_STATUS,
    timestamp,
    issues: [],
    staged_sources: stagedSources,
    output_path: outputPaths[0]?.output_path ?? null,
    output_paths: outputPaths
  });
}

const reviewPagePath = await writeReviewPage({
  batchId,
  reviewDir,
  manifestPath,
  entries
});

const manifest = {
  batch_id: batchId,
  source_batch_file: batchFilePath,
  timestamp,
  review_page: reviewPagePath,
  entries
};

await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

console.log(
  JSON.stringify(
    {
      ok: true,
      batch_id: batchId,
      manifest_path: manifestPath,
      review_page: reviewPagePath,
      processed: entries.filter((entry) => entry.output_paths.length > 0).length,
      flagged: entries.filter((entry) => entry.review_status === "flagged_missing_rights").length
    },
    null,
    2
  )
);
