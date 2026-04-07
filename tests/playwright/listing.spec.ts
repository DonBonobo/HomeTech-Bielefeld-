import fs from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const externalScreenshotDir = "/storage/emulated/0/DCIM/🤖 HomeTech🤘Bielefeld🌆/Pics/webshop-pics";
const localScreenshotDir = "/root/HomeTech-Bielefeld/artifacts/screenshots";
const bannedTerms = ["beta", "prototype", "coming soon", "waitlist", "startup", "demo", "launch"];

async function assertNoBannedLanguage(pageText: string) {
  for (const term of bannedTerms) {
    expect(pageText.toLowerCase()).not.toContain(term);
  }
}

async function saveScreenshots(page: Page, name: string) {
  await fs.mkdir(externalScreenshotDir, { recursive: true });
  await fs.mkdir(localScreenshotDir, { recursive: true });

  const external = path.join(externalScreenshotDir, name);
  const local = path.join(localScreenshotDir, name);

  await page.screenshot({ path: external, fullPage: true });
  await page.screenshot({ path: local, fullPage: true });
}

test("homepage routes into the real category listing", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.getByRole("link", { name: /Dübel/ }).click();
  await page.waitForURL("**/k/duebel");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { level: 1, name: "Dübel" })).toBeVisible();
  await expect(page.getByText("2 sichtbare Produkte")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fischer DuoPower 8x40 mm" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fischer Universal UX 6x35 mm" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kategorien" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Brand" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Material" })).toHaveCount(0);

  await assertNoBannedLanguage(await page.locator("body").innerText());

  const name =
    testInfo.project.name === "mobile" ? "category-duebel-mobile-full.png" : "category-duebel-desktop-full.png";
  await saveScreenshots(page, name);
});

test("homepage search opens the real search results surface", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.getByRole("searchbox", { name: "Produkte durchsuchen" }).fill("fischer");
  await page.getByRole("button", { name: "Suchen" }).click();
  await page.waitForURL("**/search?q=fischer");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { level: 1, name: 'Treffer für "fischer"' })).toBeVisible();
  await expect(page.getByText("2 sichtbare Produkte")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fischer DuoPower 8x40 mm" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fischer Universal UX 6x35 mm" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kategorien" })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Dübel 2$/ })).toHaveCount(1);

  await assertNoBannedLanguage(await page.locator("body").innerText());

  const name =
    testInfo.project.name === "mobile" ? "search-fischer-mobile-full.png" : "search-fischer-desktop-full.png";
  await saveScreenshots(page, name);
});
