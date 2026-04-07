import fs from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";

const externalScreenshotDir = "/storage/emulated/0/DCIM/🤖 HomeTech🤘Bielefeld🌆/Pics/webshop-pics";
const localScreenshotDir = "/root/HomeTech-Bielefeld/artifacts/screenshots";

const bannedTerms = ["beta", "prototype", "coming soon", "waitlist", "startup", "demo", "launch"];

test("homepage renders the canonical homepage slice", async ({ page }, testInfo) => {
  await fs.mkdir(externalScreenshotDir, { recursive: true });
  await fs.mkdir(localScreenshotDir, { recursive: true });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { level: 1, name: "Finden, prüfen, bestellen." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Schnell zum passenden Regal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Top-Seller" })).toBeVisible();
  await expect(page.locator("form[action='/search']")).toHaveCount(1);
  await expect(page.getByRole("link", { name: /Dübel/i })).toHaveAttribute("href", "/k/duebel");

  const categorySection = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Schnell zum passenden Regal" })
  });

  for (const category of ["Schrauben", "Dübel", "Bolzen & Muttern", "Kleben & Dichten", "Elektro", "Sanitär"]) {
    await expect(categorySection.getByRole("heading", { name: category, exact: true })).toBeVisible();
  }

  for (const product of [
    "Fischer DuoPower 8x40 mm",
    "Trockenbauschrauben PH2 3,5x35 mm",
    "Pattex Power Glue 3 g",
    "PTFE Gewindedichtband 12 m"
  ]) {
    await expect(page.getByRole("heading", { name: product })).toBeVisible();
  }

  const bodyText = (await page.locator("body").innerText()).toLowerCase();
  for (const term of bannedTerms) {
    expect(bodyText).not.toContain(term);
  }

  await expect(page.getByAltText("HomeTech Bielefeld")).toBeVisible();
  expect(await page.locator("img").count()).toBeGreaterThan(8);

  const screenshotName = testInfo.project.name === "mobile" ? "homepage-mobile-full.png" : "homepage-desktop-full.png";
  const screenshotPath = path.join(externalScreenshotDir, screenshotName);
  const localPath = path.join(localScreenshotDir, screenshotName);

  await page.screenshot({ path: screenshotPath, fullPage: true });
  await page.screenshot({ path: localPath, fullPage: true });

  if (testInfo.project.name === "desktop") {
    const cropName = "homepage-desktop-categories-top-sellers.png";
    const cropPath = path.join(externalScreenshotDir, cropName);
    const localCropPath = path.join(localScreenshotDir, cropName);
    await page.locator("main").screenshot({ path: cropPath });
    await page.locator("main").screenshot({ path: localCropPath });
  }
});
