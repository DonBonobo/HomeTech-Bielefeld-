import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/client";
import type { CategoryRow, ProductCardModel, ProductImageRow, ProductRow } from "@/lib/catalog/types";

export const reassuranceItems = [
  {
    title: "Kostenlose Same-Day-Lieferung",
    body: "Lokal aus Bielefeld, direkt aus Lagerbestand.",
    imageUrl: "/assets/reassurance/free-same-day-delivery.png"
  },
  {
    title: "Klare Staffelpreise",
    body: "Praktische Mengenrabatte ohne Marketing-Lärm.",
    imageUrl: "/assets/reassurance/bulk-discounts.png"
  },
  {
    title: "Sicherer Bestellablauf",
    body: "Kauf nach Anmeldung, sauber und nachvollziehbar.",
    imageUrl: "/assets/reassurance/secure-order-process.png"
  }
] as const;

export const getCatalogRows = cache(async () => {
  const supabase = createSupabaseServerClient();

  const [{ data: categories, error: categoryError }, { data: products, error: productError }, { data: productImages, error: imageError }] =
    await Promise.all([
      supabase.from("categories").select("*").eq("enabled", true).order("position", { ascending: true }),
      supabase.from("products").select("*").eq("visible", true).order("title", { ascending: true }),
      supabase.from("product_images").select("*").order("position", { ascending: true })
    ]);

  if (categoryError) throw categoryError;
  if (productError) throw productError;
  if (imageError) throw imageError;

  return {
    categories: (categories ?? []) as CategoryRow[],
    products: (products ?? []) as ProductRow[],
    productImages: (productImages ?? []) as ProductImageRow[]
  };
});

export function buildProductCards(
  products: ProductRow[],
  categories: CategoryRow[],
  productImages: ProductImageRow[]
): ProductCardModel[] {
  const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));
  const imagesByProductId = new Map<string, ProductImageRow[]>();

  for (const image of productImages) {
    const list = imagesByProductId.get(image.product_id) ?? [];
    list.push(image);
    imagesByProductId.set(image.product_id, list);
  }

  return products.map((product) => {
    const firstImage = imagesByProductId.get(product.id)?.[0];
    const category = categoriesBySlug.get(product.category_slug);

    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      categorySlug: product.category_slug,
      categoryLabel: category?.label ?? product.category_slug,
      line: product.line,
      spec: product.spec,
      short: product.short,
      priceCents: product.price_cents,
      stockCount: product.stock_count,
      imageUrl: firstImage?.image_url ?? product.image,
      imageAlt: firstImage?.alt_text ?? product.title,
      tags: product.compatibility ?? []
    };
  });
}
