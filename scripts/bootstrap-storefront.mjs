import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { seedCategories, seedProducts } from "../lib/storefront-seed.js";

const root = path.resolve(process.cwd());
const envPath = path.join(root, ".env.local");

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    fs.readFileSync(filePath, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

const localEnv = readEnvFile(envPath);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || localEnv.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || localEnv.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const categoryPayload = seedCategories.map((category, index) => ({
  id: category.id,
  slug: category.slug,
  label: category.label,
  enabled: category.enabled !== false,
  position: typeof category.position === "number" ? category.position : index,
}));

const productPayload = seedProducts.map((product) => ({
  id: product.id,
  slug: product.slug,
  title: product.title,
  category_slug: product.categorySlug,
  line: product.line,
  spec: product.spec,
  short: product.short,
  description: product.description,
  price_cents: product.priceCents,
  stock_count: product.stockCount,
  visible: product.visible !== false,
  image: product.image,
  gallery: product.gallery,
  compatibility: product.compatibility,
}));

const imagePayload = seedProducts.flatMap((product) =>
  (product.gallery || []).map((image, index) => ({
    product_id: product.id,
    image_url: typeof image === "string" ? image : image.src,
    alt_text: typeof image === "string" ? null : (image.alt || null),
    position: index,
  }))
);

const productIds = seedProducts.map((product) => product.id);

const { error: categoryError } = await supabase.from("categories").upsert(categoryPayload, { onConflict: "id" });
if (categoryError) {
  console.error("Failed to upsert categories.");
  console.error(categoryError);
  process.exit(1);
}

const { error: productError } = await supabase.from("products").upsert(productPayload, { onConflict: "id" });
if (productError) {
  console.error("Failed to upsert products.");
  console.error(productError);
  process.exit(1);
}

const { error: deleteImagesError } = await supabase.from("product_images").delete().in("product_id", productIds);
if (deleteImagesError) {
  console.error("Failed to clear product images.");
  console.error(deleteImagesError);
  process.exit(1);
}

if (imagePayload.length) {
  const { error: imageError } = await supabase.from("product_images").insert(imagePayload);
  if (imageError) {
    console.error("Failed to insert product images.");
    console.error(imageError);
    process.exit(1);
  }
}

console.log(`Seeded ${categoryPayload.length} categories, ${productPayload.length} products, ${imagePayload.length} product images.`);
