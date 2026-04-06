export function getVisualPreview() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.__HOMETECH_VISUAL_PREVIEW__ || null;
}
