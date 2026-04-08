import { ALLOWED_SOURCE_TYPES, DEFAULT_REVIEW_STATUS } from "./constants.mjs";

export function validateBatchItem(item) {
  const issues = [];

  if (!item?.sku?.trim()) issues.push("missing-sku");
  if (!item?.brand?.trim()) issues.push("missing-brand");
  if (!item?.sourceType?.trim()) {
    issues.push("missing-source-type");
  } else if (!ALLOWED_SOURCE_TYPES.has(item.sourceType)) {
    issues.push(`disallowed-source-type:${item.sourceType}`);
  }

  if (item?.rightsConfirmed !== true) {
    issues.push("rights-not-confirmed");
  }

  const sourceCount = (item?.sourcePaths?.length ?? 0) + (item?.sourceUrls?.length ?? 0);
  if (!sourceCount) {
    issues.push("missing-sources");
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

export function buildFlaggedEntry(item, batchId, timestamp, issues) {
  return {
    sku: item?.sku ?? "",
    slug: item?.slug ?? item?.sku ?? "",
    brand: item?.brand ?? "",
    ean: item?.ean ?? null,
    gtin: item?.gtin ?? null,
    source_type: item?.sourceType ?? null,
    source_paths: item?.sourcePaths ?? [],
    source_urls: item?.sourceUrls ?? [],
    source_path: item?.sourcePaths?.[0] ?? null,
    source_url: item?.sourceUrls?.[0] ?? null,
    rights_confirmed: item?.rightsConfirmed ?? false,
    rights_note: item?.rightsNote ?? "",
    processing_mode: item?.processingMode ?? "normalize",
    batch_id: batchId,
    review_status: "flagged_missing_rights",
    accepted_review_status: DEFAULT_REVIEW_STATUS,
    timestamp,
    issues,
    output_path: null,
    output_paths: [],
    staged_sources: []
  };
}
