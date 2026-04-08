import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { CONTENT_BOX, OUTPUT_SIZE } from "./constants.mjs";
import { outputName } from "./io.mjs";

async function normalizeSingleSource(sourcePath, outputPath, mode) {
  const base = sharp(sourcePath, { failOn: "none" }).rotate().flatten({ background: "#ffffff" });
  const trimmedBuffer = await base.trim({ background: "#ffffff", threshold: 10 }).toBuffer();

  let pipeline = sharp(trimmedBuffer)
    .resize({
      width: CONTENT_BOX,
      height: CONTENT_BOX,
      fit: "inside",
      withoutEnlargement: false,
      kernel: sharp.kernel.lanczos3
    })
    .flatten({ background: "#ffffff" });

  if (mode === "enhance") {
    pipeline = pipeline.modulate({ brightness: 1.02, saturation: 0.98 }).sharpen();
  }

  await pipeline
    .resize({
      width: OUTPUT_SIZE,
      height: OUTPUT_SIZE,
      fit: "contain",
      background: "#ffffff"
    })
    .png()
    .toFile(outputPath);

  const metadata = await sharp(outputPath).metadata();

  return {
    outputPath,
    width: metadata.width ?? OUTPUT_SIZE,
    height: metadata.height ?? OUTPUT_SIZE
  };
}

export async function normalizeSources({ sku, sourceRecords, exportDir, processingMode }) {
  await fs.mkdir(exportDir, { recursive: true });

  const outputs = [];
  for (let index = 0; index < sourceRecords.length; index += 1) {
    const sourceRecord = sourceRecords[index];
    const kind = index === 0 ? "hero" : "alt";
    const fileName = outputName(sku, kind, index);
    const outputPath = path.join(exportDir, fileName);
    const output = await normalizeSingleSource(sourceRecord.staged, outputPath, processingMode);
    outputs.push({
      kind,
      output_path: output.outputPath,
      width: output.width,
      height: output.height
    });
  }

  return outputs;
}
