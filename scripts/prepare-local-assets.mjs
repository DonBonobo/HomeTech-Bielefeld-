import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const externalRoot = "/storage/emulated/0/DCIM/🤖 HomeTech🤘Bielefeld🌆/Pics";
const projectRoot = "/root/HomeTech-Bielefeld";

const outputDirs = [
  path.join(externalRoot, "Logos", "prepared"),
  path.join(externalRoot, "product-images", "prepared"),
  path.join(externalRoot, "webshop-pics", "prepared"),
  path.join(projectRoot, "public", "assets", "brand"),
  path.join(projectRoot, "public", "assets", "products"),
  path.join(projectRoot, "public", "assets", "reassurance")
];

for (const dir of outputDirs) {
  await fs.mkdir(dir, { recursive: true });
}

const assets = [
  {
    source: path.join(externalRoot, "Logos", "file_000000006f40720a82423d9f6e7e7e73.png"),
    crops: [
      {
        name: "hometech-bielefeld-logo-horizontal.png",
        external: path.join(externalRoot, "Logos", "prepared", "hometech-bielefeld-logo-horizontal.png"),
        project: path.join(projectRoot, "public", "assets", "brand", "hometech-bielefeld-logo-horizontal.png"),
        extract: { left: 40, top: 55, width: 760, height: 210 }
      }
    ]
  },
  {
    source: path.join(externalRoot, "webshop-pics", "file_0000000031687243853f591120841965.png"),
    crops: [
      {
        name: "free-same-day-delivery.png",
        external: path.join(externalRoot, "webshop-pics", "prepared", "free-same-day-delivery.png"),
        project: path.join(projectRoot, "public", "assets", "reassurance", "free-same-day-delivery.png"),
        extract: { left: 0, top: 0, width: 768, height: 341 }
      },
      {
        name: "bulk-discounts.png",
        external: path.join(externalRoot, "webshop-pics", "prepared", "bulk-discounts.png"),
        project: path.join(projectRoot, "public", "assets", "reassurance", "bulk-discounts.png"),
        extract: { left: 768, top: 0, width: 768, height: 341 }
      },
      {
        name: "secure-order-process.png",
        external: path.join(externalRoot, "webshop-pics", "prepared", "secure-order-process.png"),
        project: path.join(projectRoot, "public", "assets", "reassurance", "secure-order-process.png"),
        extract: { left: 0, top: 341, width: 768, height: 341 }
      },
      {
        name: "returns-support.png",
        external: path.join(externalRoot, "webshop-pics", "prepared", "returns-support.png"),
        project: path.join(projectRoot, "public", "assets", "reassurance", "returns-support.png"),
        extract: { left: 768, top: 341, width: 768, height: 341 }
      }
    ]
  },
  {
    source: path.join(externalRoot, "product-images", "file_000000003200720a8e7151ba21b43440.png"),
    crops: [
      {
        name: "fischer-duopower-8x40-50.png",
        external: path.join(externalRoot, "product-images", "prepared", "fischer-duopower-8x40-50.png"),
        project: path.join(projectRoot, "public", "assets", "products", "fischer-duopower-8x40-50.png"),
        extract: { left: 0, top: 70, width: 430, height: 380 }
      },
      {
        name: "fischer-universal-ux-6x35-100.png",
        external: path.join(externalRoot, "product-images", "prepared", "fischer-universal-ux-6x35-100.png"),
        project: path.join(projectRoot, "public", "assets", "products", "fischer-universal-ux-6x35-100.png"),
        extract: { left: 280, top: 80, width: 320, height: 340 }
      },
      {
        name: "tox-metal-fixings-m5x32-50.png",
        external: path.join(externalRoot, "product-images", "prepared", "tox-metal-fixings-m5x32-50.png"),
        project: path.join(projectRoot, "public", "assets", "products", "tox-metal-fixings-m5x32-50.png"),
        extract: { left: 880, top: 70, width: 290, height: 340 }
      },
      {
        name: "ph2-drywall-screws-100.png",
        external: path.join(externalRoot, "product-images", "prepared", "ph2-drywall-screws-100.png"),
        project: path.join(projectRoot, "public", "assets", "products", "ph2-drywall-screws-100.png"),
        extract: { left: 10, top: 500, width: 420, height: 360 }
      },
      {
        name: "brass-wood-screws-5x60-50.png",
        external: path.join(externalRoot, "product-images", "prepared", "brass-wood-screws-5x60-50.png"),
        project: path.join(projectRoot, "public", "assets", "products", "brass-wood-screws-5x60-50.png"),
        extract: { left: 360, top: 510, width: 320, height: 330 }
      },
      {
        name: "assorted-nuts-washers-set.png",
        external: path.join(externalRoot, "product-images", "prepared", "assorted-nuts-washers-set.png"),
        project: path.join(projectRoot, "public", "assets", "products", "assorted-nuts-washers-set.png"),
        extract: { left: 1060, top: 470, width: 420, height: 360 }
      }
    ]
  },
  {
    source: path.join(externalRoot, "product-images", "file_00000000e964720ab7b068f1209db6d9 (1).png"),
    crops: [
      {
        name: "pattex-power-glue-3g.png",
        external: path.join(externalRoot, "product-images", "prepared", "pattex-power-glue-3g.png"),
        project: path.join(projectRoot, "public", "assets", "products", "pattex-power-glue-3g.png"),
        extract: { left: 0, top: 20, width: 470, height: 390 }
      },
      {
        name: "x-tack-montagekleber-290ml.png",
        external: path.join(externalRoot, "product-images", "prepared", "x-tack-montagekleber-290ml.png"),
        project: path.join(projectRoot, "public", "assets", "products", "x-tack-montagekleber-290ml.png"),
        extract: { left: 470, top: 20, width: 270, height: 350 }
      },
      {
        name: "tec7-construction-sealant-300ml.png",
        external: path.join(externalRoot, "product-images", "prepared", "tec7-construction-sealant-300ml.png"),
        project: path.join(projectRoot, "public", "assets", "products", "tec7-construction-sealant-300ml.png"),
        extract: { left: 780, top: 20, width: 260, height: 350 }
      },
      {
        name: "sanitary-silicone-white-280ml.png",
        external: path.join(externalRoot, "product-images", "prepared", "sanitary-silicone-white-280ml.png"),
        project: path.join(projectRoot, "public", "assets", "products", "sanitary-silicone-white-280ml.png"),
        extract: { left: 1060, top: 10, width: 290, height: 360 }
      },
      {
        name: "ptfe-gewindedichtband-12m.png",
        external: path.join(externalRoot, "product-images", "prepared", "ptfe-gewindedichtband-12m.png"),
        project: path.join(projectRoot, "public", "assets", "products", "ptfe-gewindedichtband-12m.png"),
        extract: { left: 0, top: 390, width: 290, height: 250 }
      },
      {
        name: "pipe-gasket-repair-kit.png",
        external: path.join(externalRoot, "product-images", "prepared", "pipe-gasket-repair-kit.png"),
        project: path.join(projectRoot, "public", "assets", "products", "pipe-gasket-repair-kit.png"),
        extract: { left: 420, top: 380, width: 400, height: 280 }
      },
      {
        name: "terminal-block-set-12-polig.png",
        external: path.join(externalRoot, "product-images", "prepared", "terminal-block-set-12-polig.png"),
        project: path.join(projectRoot, "public", "assets", "products", "terminal-block-set-12-polig.png"),
        extract: { left: 420, top: 710, width: 540, height: 240 }
      },
      {
        name: "cable-gland-grommet-set.png",
        external: path.join(externalRoot, "product-images", "prepared", "cable-gland-grommet-set.png"),
        project: path.join(projectRoot, "public", "assets", "products", "cable-gland-grommet-set.png"),
        extract: { left: 1030, top: 340, width: 470, height: 360 }
      }
    ]
  }
];

for (const asset of assets) {
  for (const crop of asset.crops) {
    const buffer = await sharp(asset.source)
      .extract(crop.extract)
      .resize({
        width: 900,
        height: 900,
        fit: "contain",
        withoutEnlargement: true,
        background: "#ffffff"
      })
      .png()
      .toBuffer();

    await fs.writeFile(crop.external, buffer);
    await fs.writeFile(crop.project, buffer);
  }
}

console.log("Prepared local assets into external folders and public/assets.");
