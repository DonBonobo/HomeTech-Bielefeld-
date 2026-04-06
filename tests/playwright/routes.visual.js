const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const ARTIFACT_ROOT = path.join(process.cwd(), "artifacts", "playwright");
const SCREENSHOT_ROOT = path.join(ARTIFACT_ROOT, "screenshots");
const manifestEntries = [];

const cartSeed = [
  { id: "white-ambiance-e27-1100", quantity: 1 },
  { id: "white-e27-filament-550", quantity: 1 },
];

const previewUser = {
  session: { access_token: "visual-preview-token" },
  user: { id: "visual-user-1", email: "kunde@hometech-bielefeld.de" },
  profile: { id: "visual-user-1", email: "kunde@hometech-bielefeld.de", full_name: "Max Muster", role: "customer" },
};

const previewOrders = [
  { id: "ORDER-2026-0001", status: "captured", total_cents: 8092, created_at: "2026-04-06T10:00:00.000Z" },
  { id: "ORDER-2026-0002", status: "pending", total_cents: 2499, created_at: "2026-04-04T10:00:00.000Z" },
];

const mobileViewport = { width: 390, height: 844 };
const desktopViewport = { width: 1440, height: 1280 };

const mobileCases = [
  { name: "home", route: "/", selector: "text=Beliebte Leuchtmittel" },
  { name: "category-leuchtmittel", route: "/kategorie/leuchtmittel", selector: "text=Leuchtmittel für dein Zuhause" },
  { name: "product-white-ambiance-e27-1100", route: "/produkt/philips-hue-white-ambiance-e27-1100", selector: "h1" },
  { name: "checkout-guest", route: "/checkout", selector: "text=Bitte melde dich vor der Bezahlung an.", cart: cartSeed },
  { name: "checkout-auth", route: "/checkout", selector: "[data-testid='paypal-panel']", cart: cartSeed, auth: previewUser },
  { name: "konto-guest", route: "/konto", selector: "text=Mit E-Mail anmelden" },
  { name: "konto-auth", route: "/konto", selector: "text=Letzte Bestellungen", auth: previewUser, orders: previewOrders },
  { name: "impressum", route: "/impressum", selector: "text=HomeTech Bielefeld" },
  { name: "kontakt", route: "/kontakt", selector: "text=Bitte zuerst anmelden" },
  { name: "feedback", route: "/feedback", selector: "text=Rückmeldung senden" },
];

const desktopCases = [
  { name: "home", route: "/", selector: "text=Beliebte Leuchtmittel" },
  { name: "product-white-ambiance-e27-1100", route: "/produkt/philips-hue-white-ambiance-e27-1100", selector: "h1" },
  { name: "checkout-auth", route: "/checkout", selector: "[data-testid='paypal-panel']", cart: cartSeed, auth: previewUser },
  { name: "konto-auth", route: "/konto", selector: "text=Letzte Bestellungen", auth: previewUser, orders: previewOrders },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeManifest() {
  ensureDir(SCREENSHOT_ROOT);
  fs.writeFileSync(path.join(SCREENSHOT_ROOT, "manifest.json"), JSON.stringify({
    generatedAt: new Date().toISOString(),
    entries: manifestEntries,
  }, null, 2));
}

async function seedPreview(page, options = {}) {
  await page.addInitScript((payload) => {
    if (payload.cart) {
      window.localStorage.setItem("hometech.next.cart.guest.v2", JSON.stringify(payload.cart));
    } else {
      window.localStorage.removeItem("hometech.next.cart.guest.v2");
    }

    if (payload.auth) {
      window.__HOMETECH_VISUAL_PREVIEW__ = {
        auth: payload.auth,
        cart: payload.cart || [],
        orders: payload.orders || [],
      };
    } else {
      window.__HOMETECH_VISUAL_PREVIEW__ = payload.cart ? { cart: payload.cart } : null;
    }
  }, options);
}

async function captureCase(page, bucket, viewport, entry) {
  await page.setViewportSize(viewport);
  await seedPreview(page, entry);
  await page.goto(entry.route, { waitUntil: "networkidle" });
  await expect(page.locator(entry.selector).first()).toBeVisible();
  await page.waitForTimeout(250);

  const outputDir = path.join(SCREENSHOT_ROOT, bucket);
  ensureDir(outputDir);
  const outputFile = path.join(outputDir, `${entry.name}.png`);
  await page.screenshot({ path: outputFile, fullPage: true });

  manifestEntries.push({
    route: entry.route,
    viewport,
    outputFile,
    timestamp: new Date().toISOString(),
  });
}

test.describe.serial("visual captures", () => {
  test.afterAll(async () => {
    writeManifest();
  });

  test("capture mobile storefront routes", async ({ page }) => {
    for (const entry of mobileCases) {
      await captureCase(page, "mobile", mobileViewport, entry);
    }
  });

  test("capture desktop storefront routes", async ({ page }) => {
    for (const entry of desktopCases) {
      await captureCase(page, "desktop", desktopViewport, entry);
    }
  });
});
