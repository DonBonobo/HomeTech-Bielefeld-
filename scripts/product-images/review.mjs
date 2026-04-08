import fs from "node:fs/promises";
import path from "node:path";

function rel(from, to) {
  return path.relative(from, to).split(path.sep).join("/");
}

function renderEntryCard(reviewDir, entry) {
  const sourceImage = entry.staged_sources[0]?.staged ?? null;
  const heroImage = entry.output_paths[0]?.output_path ?? null;

  return `
    <article class="card">
      <header>
        <h2>${entry.sku}</h2>
        <p>${entry.brand} · ${entry.source_type ?? "unknown"} · ${entry.review_status}</p>
      </header>
      <div class="meta">
        <span>Rights confirmed: ${entry.rights_confirmed ? "yes" : "no"}</span>
        <span>Processing: ${entry.processing_mode}</span>
        <span>GTIN/EAN: ${entry.gtin ?? entry.ean ?? "n/a"}</span>
      </div>
      <p class="note">${entry.rights_note || "No rights note supplied."}</p>
      <div class="images">
        <figure>
          <figcaption>Source</figcaption>
          ${
            sourceImage
              ? `<img src="${rel(reviewDir, sourceImage)}" alt="Source for ${entry.sku}" />`
              : `<div class="placeholder">No staged source</div>`
          }
        </figure>
        <figure>
          <figcaption>Storefront Output</figcaption>
          ${
            heroImage
              ? `<img src="${rel(reviewDir, heroImage)}" alt="Output for ${entry.sku}" />`
              : `<div class="placeholder">No output</div>`
          }
        </figure>
      </div>
      ${entry.issues?.length ? `<p class="issues">Issues: ${entry.issues.join(", ")}</p>` : ""}
    </article>
  `;
}

export async function writeReviewPage({ batchId, reviewDir, manifestPath, entries }) {
  await fs.mkdir(reviewDir, { recursive: true });
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>HomeTech Product Image Review · ${batchId}</title>
    <style>
      body { margin: 0; background: #f6f7f9; color: #20242b; font-family: "Segoe UI", Arial, sans-serif; }
      main { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 24px 0 40px; display: grid; gap: 16px; }
      .intro, .card { background: #fff; border: 1px solid #d8dde5; border-radius: 10px; padding: 16px; }
      .cards { display: grid; gap: 12px; }
      .meta { display: flex; flex-wrap: wrap; gap: 8px 16px; color: #616c7a; font-size: 13px; }
      .images { display: grid; gap: 12px; margin-top: 12px; }
      figure { margin: 0; display: grid; gap: 8px; }
      figcaption { font-size: 13px; color: #616c7a; }
      img { width: 100%; border: 1px solid #d8dde5; border-radius: 8px; background: #fff; }
      .placeholder { border: 1px dashed #c4ccd8; border-radius: 8px; padding: 24px; color: #616c7a; }
      .note, .issues { margin: 10px 0 0; font-size: 13px; color: #616c7a; }
      @media (min-width: 900px) { .images { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    </style>
  </head>
  <body>
    <main>
      <section class="intro">
        <h1>HomeTech Product Image Review</h1>
        <p>Batch: ${batchId}</p>
        <p>Manifest: ${manifestPath}</p>
      </section>
      <section class="cards">
        ${entries.map((entry) => renderEntryCard(reviewDir, entry)).join("\n")}
      </section>
    </main>
  </body>
</html>`;

  const outputPath = path.join(reviewDir, "index.html");
  await fs.writeFile(outputPath, html, "utf8");
  return outputPath;
}
