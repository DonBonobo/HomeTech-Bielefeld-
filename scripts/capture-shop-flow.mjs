import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { chromium, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const [, , baseUrlArg, outputDirArg, prefixArg = "proof"] = process.argv;

if (!baseUrlArg || !outputDirArg) {
  console.error("Usage: node scripts/capture-shop-flow.mjs <base-url> <output-dir> [prefix]");
  process.exit(1);
}

const baseUrl = baseUrlArg.replace(/\/$/, "");
const outputDir = outputDirArg;
const prefix = prefixArg;
const bannedTerms = ["beta", "prototype", "coming soon", "waitlist", "startup", "demo", "launch"];
const confirmationRegex = /\/order-request\/([^/?#]+)/;

function readEnvFile(filePath) {
  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

async function addBanner(page, label, requestedUrl) {
  await page.evaluate(
    ({ currentLabel, targetUrl }) => {
      const existing = document.getElementById("__runtime-proof-banner");
      if (existing) existing.remove();

      const banner = document.createElement("div");
      banner.id = "__runtime-proof-banner";
      banner.innerHTML = `<div>${currentLabel}</div><div>Requested: ${targetUrl}</div><div>Loaded: ${window.location.href}</div>`;
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
    },
    { currentLabel: label, targetUrl: requestedUrl }
  );
}

async function assertNoBannedLanguage(page) {
  const bodyText = (await page.locator("body").innerText()).toLowerCase();
  for (const term of bannedTerms) {
    expect(bodyText).not.toContain(term);
  }
}

async function capture(page, requestedUrl, label, fileName) {
  await page.goto(requestedUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  await page.waitForTimeout(1200);
  await assertNoBannedLanguage(page);
  await addBanner(page, label, requestedUrl);
  await page.screenshot({ path: path.join(outputDir, fileName), fullPage: true });
}

async function verifyPersistedOrder(orderId) {
  const envPath = "/root/HomeTech-Bielefeld/.env.local";
  if (!fs.existsSync(envPath)) {
    return { verified: false, reason: "missing-env-file" };
  }

  const env = readEnvFile(envPath);
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return { verified: false, reason: "missing-service-role-key" };
  }

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const [{ data: orders, error: orderError }, { data: items, error: itemError }] = await Promise.all([
    supabase.from("orders").select("id,status,total_cents,created_at,paypal_order_id").eq("id", orderId),
    supabase.from("order_items").select("id,order_id,product_id,quantity,price_cents").eq("order_id", orderId)
  ]);

  if (orderError || itemError) {
    return {
      verified: false,
      reason: orderError?.message ?? itemError?.message ?? "query-failed"
    };
  }

  return {
    verified: Boolean(orders?.length && items?.length),
    order: orders?.[0] ?? null,
    orderItems: items ?? []
  };
}

await fsp.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1400 }
});
const page = await context.newPage();

try {
  await capture(page, `${baseUrl}/`, `${prefix} homepage`, `${prefix}-homepage.png`);
  await expect(page.getByRole("heading", { level: 1, name: "Finden, prüfen, bestellen." })).toBeVisible();

  await capture(page, `${baseUrl}/search?q=fischer`, `${prefix} search`, `${prefix}-search-fischer.png`);
  await expect(page.getByRole("heading", { level: 1, name: 'Treffer für "fischer"' })).toBeVisible();

  await capture(page, `${baseUrl}/k/duebel`, `${prefix} category`, `${prefix}-category-duebel.png`);
  await expect(page.getByRole("heading", { level: 1, name: "Dübel" })).toBeVisible();

  await capture(
    page,
    `${baseUrl}/p/fischer-duopower-8x40-50`,
    `${prefix} product`,
    `${prefix}-product-fischer-duopower.png`
  );
  await expect(page.getByRole("heading", { level: 1, name: "Fischer DuoPower 8x40 mm" })).toBeVisible();

  const addToCartButton = page.getByRole("button", { name: "In den Warenkorb" }).first();
  await addToCartButton.scrollIntoViewIfNeeded();
  await addToCartButton.evaluate((node) => node.click());
  await page.waitForTimeout(600);
  await page.goto(`${baseUrl}/cart`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  await expect(page.getByRole("heading", { level: 1, name: "Warenkorb" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fischer DuoPower 8x40 mm" })).toBeVisible();
  await assertNoBannedLanguage(page);
  await addBanner(page, `${prefix} cart`, `${baseUrl}/cart`);
  await page.screenshot({ path: path.join(outputDir, `${prefix}-cart.png`), fullPage: true });

  await page.goto(`${baseUrl}/checkout`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  await expect(page.getByRole("heading", { level: 1, name: "Bestellanfrage" })).toBeVisible();
  await assertNoBannedLanguage(page);
  await addBanner(page, `${prefix} checkout`, `${baseUrl}/checkout`);
  await page.screenshot({ path: path.join(outputDir, `${prefix}-checkout.png`), fullPage: true });

  const marker = `${prefix}-qa-${Date.now()}`;
  await page.getByLabel("Name").fill("HomeTech QA");
  await page.getByLabel("E-Mail").fill(`${marker}@example.com`);
  await page.getByLabel("Telefon").fill("0521 555 123");
  await page.getByLabel("Straße & Hausnummer").fill("Niederwall 23");
  await page.getByLabel("PLZ").fill("33602");
  await page.getByLabel("Ort").fill("Bielefeld");
  await page.getByLabel("Hinweise zur Lieferung").fill(`QA flow verification for ${prefix}`);

  await Promise.all([
    page.waitForURL(confirmationRegex, { timeout: 60_000 }),
    page.getByRole("button", { name: "Bestellanfrage senden" }).click()
  ]);

  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  await expect(page.getByRole("heading", { level: 1, name: "Bestellanfrage erhalten" })).toBeVisible();
  await assertNoBannedLanguage(page);

  const confirmationUrl = page.url();
  const orderId = confirmationUrl.match(confirmationRegex)?.[1];
  if (!orderId) {
    throw new Error(`Could not extract order request id from ${confirmationUrl}`);
  }

  await addBanner(page, `${prefix} confirmation`, confirmationUrl);
  await page.screenshot({
    path: path.join(outputDir, `${prefix}-order-request-confirmation.png`),
    fullPage: true
  });

  const persistence = await verifyPersistedOrder(orderId);
  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        orderId,
        persistence
      },
      null,
      2
    )
  );
} finally {
  await context.close();
  await browser.close();
}
