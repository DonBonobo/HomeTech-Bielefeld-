import fs from "node:fs/promises";
import path from "node:path";

const envFile = "/storage/emulated/0/DCIM/🤖 HomeTech🤘Bielefeld🌆/env.txt";
const seedFile = path.join("/root/HomeTech-Bielefeld", "seed", "homepage-catalog.json");

const envText = await fs.readFile(envFile, "utf8");
for (const token of envText.match(/[A-Z0-9_]+=[^\s]+/g) ?? []) {
  const [key, ...rest] = token.split("=");
  process.env[key] = rest.join("=");
}

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!baseUrl || !serviceRoleKey) {
  throw new Error("Supabase environment is missing.");
}

const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  "Content-Type": "application/json"
};

const seed = JSON.parse(await fs.readFile(seedFile, "utf8"));

async function request(method, endpoint, body) {
  const response = await fetch(`${baseUrl}/rest/v1/${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} ${endpoint} failed: ${response.status} ${text}`);
  }

  return response;
}

await request("PATCH", "products?id=not.is.null", { visible: false });
await request("PATCH", "categories?id=not.is.null", { enabled: false });
await request("DELETE", "product_images?product_id=not.is.null");

await fetch(`${baseUrl}/rest/v1/categories?on_conflict=slug`, {
  method: "POST",
  headers: {
    ...headers,
    Prefer: "resolution=merge-duplicates"
  },
  body: JSON.stringify(
    seed.categories.map((category) => ({
      ...category,
      enabled: true
    }))
  )
}).then(async (response) => {
  if (!response.ok) {
    throw new Error(`POST categories failed: ${response.status} ${await response.text()}`);
  }
});

await fetch(`${baseUrl}/rest/v1/products?on_conflict=id`, {
  method: "POST",
  headers: {
    ...headers,
    Prefer: "resolution=merge-duplicates"
  },
  body: JSON.stringify(seed.products)
}).then(async (response) => {
  if (!response.ok) {
    throw new Error(`POST products failed: ${response.status} ${await response.text()}`);
  }
});

await fetch(`${baseUrl}/rest/v1/product_images`, {
  method: "POST",
  headers,
  body: JSON.stringify(seed.productImages)
}).then(async (response) => {
  if (!response.ok) {
    throw new Error(`POST product_images failed: ${response.status} ${await response.text()}`);
  }
});

console.log(
  `Seeded homepage catalog with ${seed.categories.length} categories, ${seed.products.length} products, and ${seed.productImages.length} product images.`
);
