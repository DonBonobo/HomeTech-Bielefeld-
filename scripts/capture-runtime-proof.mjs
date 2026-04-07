import { chromium } from "@playwright/test";

const [, , url, outputPath, label = "Proof"] = process.argv;

if (!url || !outputPath) {
  console.error("Usage: node scripts/capture-runtime-proof.mjs <url> <output-path> [label]");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1200 }
});

try {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60_000
  });
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);
  await page.waitForTimeout(1200);

  await page.evaluate(({ currentLabel, requestedUrl }) => {
    const existing = document.getElementById("__runtime-proof-banner");
    if (existing) existing.remove();

    const banner = document.createElement("div");
    banner.id = "__runtime-proof-banner";
    banner.innerHTML = `<div>${currentLabel}</div><div>Requested: ${requestedUrl}</div><div>Loaded: ${window.location.href}</div>`;
    banner.setAttribute(
      "style",
      [
        "position:fixed",
        "top:0",
        "left:0",
        "right:0",
        "z-index:2147483647",
        "padding:12px 16px",
        "background:#111827",
        "color:#ffffff",
        "font:600 16px/1.35 Arial,sans-serif",
        "box-shadow:0 2px 12px rgba(0,0,0,0.28)"
      ].join(";")
    );

    document.body.style.paddingTop = "84px";
    document.body.prepend(banner);
  }, { currentLabel: label, requestedUrl: url });

  await page.screenshot({
    path: outputPath,
    fullPage: true
  });
} finally {
  await browser.close();
}
