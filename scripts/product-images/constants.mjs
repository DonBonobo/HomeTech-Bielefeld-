import path from "node:path";

export const PRODUCT_IMAGE_ROOT = "/storage/emulated/0/DCIM/🤖 HomeTech🤘Bielefeld🌆/Pics/product-images";
export const PIPELINE_ROOT = path.join(PRODUCT_IMAGE_ROOT, "pipeline");

export const PIPELINE_DIRS = {
  staging: path.join(PIPELINE_ROOT, "staging"),
  exports: path.join(PIPELINE_ROOT, "exports"),
  manifests: path.join(PIPELINE_ROOT, "manifests"),
  review: path.join(PIPELINE_ROOT, "review")
};

export const OUTPUT_SIZE = 1200;
export const CONTENT_BOX = 980;
export const ALLOWED_SOURCE_TYPES = new Set([
  "user-provided",
  "owned",
  "licensed",
  "manufacturer",
  "approved-reference",
  "approved-distributor"
]);

export const DEFAULT_REVIEW_STATUS = "pending_review";
