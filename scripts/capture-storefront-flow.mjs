import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "@playwright/test";

const [, , baseUrlArg, outputDirArg] = process.argv;

if (!baseUrlArg || !outputDirArg) {
  console.error("Usage: node scripts/capture-storefront-flow.mjs <base-url> <output-dir>");
  process.exit(1);
}

const baseUrl = baseUrlArg.replace(/\/$/, "");
const outputDir = outputDirArg;
const confirmationRegex = /\/order-request\/([^/?#]+)/;

const deviceConfigs = [
  {
    name: "desktop",
    context: {
      viewport: { width: 1440, height: 1400 }
    }
  },
  {
    name: "mobile",
    context: {
      ...devices["Pixel 7"]
    }
  }
];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !line.startsWith("#"))
      .filter((line) => line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

async function waitForSettled(page) {
  await page.waitForLoadState("domcontentloaded", { timeout: 60_000 });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  await page.waitForTimeout(700);
}

async function capture(page, url, filePath) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await waitForSettled(page);
  await page.screenshot({ path: filePath, fullPage: true });
}

async function verifyPersistedOrder(orderId) {
  const env = parseEnvFile("/root/HomeTech-Bielefeld/.env.local");

  if (!env?.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      verified: false,
      reason: "missing-local-service-role-env"
    };
  }

  const response = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders?select=id,status,total_cents,created_at,paypal_order_id&id=eq.${orderId}`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: "application/json"
      }
    }
  );

  if (!response.ok) {
    return {
      verified: false,
      reason: `orders-query-failed:${response.status}`
    };
  }

  const orders = await response.json();

  const itemResponse = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/order_items?select=id,order_id,product_id,quantity,price_cents&order_id=eq.${orderId}`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: "application/json"
      }
    }
  );

  if (!itemResponse.ok) {
    return {
      verified: false,
      reason: `items-query-failed:${itemResponse.status}`
    };
  }

  const items = await itemResponse.json();

  return {
    verified: Boolean(orders?.length && items?.length),
    order: orders?.[0] ?? null,
    orderItems: items ?? []
  };
}

async function runDevice(browser, config) {
  const context = await browser.newContext(config.context);
  const page = await context.newPage();
  const deviceDir = path.join(outputDir, config.name);
  await fsp.mkdir(deviceDir, { recursive: true });

  try {
    const homepageUrl = `${baseUrl}/`;
    const searchUrl = `${baseUrl}/search?q=fischer`;
    const categoryUrl = `${baseUrl}/k/duebel`;
    const productUrl = `${baseUrl}/p/fischer-duopower-8x40-50`;
    const cartUrl = `${baseUrl}/cart`;
    const checkoutUrl = `${baseUrl}/checkout`;

    await capture(page, homepageUrl, path.join(deviceDir, `${config.name}-homepage.png`));
    await capture(page, searchUrl, path.join(deviceDir, `${config.name}-search-fischer.png`));
    await capture(page, categoryUrl, path.join(deviceDir, `${config.name}-category-duebel.png`));
    await capture(page, productUrl, path.join(deviceDir, `${config.name}-product-fischer-duopower.png`));

    const addToCartButton = page.getByRole("button", { name: /In den Warenkorb|Im Warenkorb|Maximale Menge im Warenkorb/ }).first();
    await addToCartButton.scrollIntoViewIfNeeded();
    await addToCartButton.click();
    await page.waitForTimeout(500);

    await capture(page, cartUrl, path.join(deviceDir, `${config.name}-cart.png`));
    await page.goto(checkoutUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await waitForSettled(page);

    const marker = `${config.name}-${Date.now()}`;
    await page.getByRole("textbox", { name: "Name" }).fill("HomeTech QA");
    await page.getByRole("textbox", { name: "E-Mail" }).fill(`${marker}@example.com`);
    await page.getByRole("textbox", { name: "Telefon" }).fill("0521 555 123");
    await page.getByRole("textbox", { name: "Straße & Hausnummer" }).fill("Niederwall 23");
    await page.getByRole("textbox", { name: "PLZ" }).fill("33602");
    await page.getByRole("textbox", { name: "Ort" }).fill("Bielefeld");
    await page.getByRole("textbox", { name: "Hinweise zur Lieferung" }).fill(`UI convergence QA for ${config.name}`);

    await page.screenshot({ path: path.join(deviceDir, `${config.name}-checkout.png`), fullPage: true });

    await Promise.all([
      page.waitForURL(confirmationRegex, { timeout: 60_000 }),
      page.getByRole("button", { name: "Ohne PayPal als Bestellanfrage senden" }).click()
    ]);

    await waitForSettled(page);
    await page.screenshot({
      path: path.join(deviceDir, `${config.name}-order-request-confirmation.png`),
      fullPage: true
    });

    const confirmationUrl = page.url();
    const orderId = confirmationUrl.match(confirmationRegex)?.[1] ?? null;

    return {
      orderId,
      urls: {
        homepageUrl,
        searchUrl,
        categoryUrl,
        productUrl,
        cartUrl,
        checkoutUrl,
        confirmationUrl
      }
    };
  } finally {
    await context.close();
  }
}

await fsp.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  const devicesSummary = {};

  for (const config of deviceConfigs) {
    devicesSummary[config.name] = await runDevice(browser, config);
  }

  const desktopOrderId = devicesSummary.desktop?.orderId ?? null;
  const persistence = desktopOrderId ? await verifyPersistedOrder(desktopOrderId) : null;
  const summary = {
    ok: true,
    baseUrl,
    devices: devicesSummary,
    persistence
  };

  await fsp.writeFile(path.join(outputDir, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await browser.close();
}
