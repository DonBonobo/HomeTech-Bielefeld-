import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/client";
import type {
  CategoryRow,
  HomepageData,
  ProductCardModel,
  ProductImageRow,
  ProductRow
} from "@/lib/catalog/types";

type Filters = {
  q?: string;
  category?: string;
};

const reassuranceItems = [
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

export { reassuranceItems };

const getCatalogRows = cache(async () => {
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

function normalize(text: string) {
  return text.trim().toLocaleLowerCase("de-DE");
}

function toCardModel(
  product: ProductRow,
  categoriesBySlug: Map<string, CategoryRow>,
  imagesByProductId: Map<string, ProductImageRow[]>
): ProductCardModel {
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
}

export async function getHomepageData(filters: Filters): Promise<HomepageData> {
  const { categories, products, productImages } = await getCatalogRows();

  const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));
  const imagesByProductId = new Map<string, ProductImageRow[]>();

  for (const image of productImages) {
    const list = imagesByProductId.get(image.product_id) ?? [];
    list.push(image);
    imagesByProductId.set(image.product_id, list);
  }

  const activeQuery = filters.q?.trim() ?? "";
  const activeCategory = filters.category?.trim() ?? "";
  const query = normalize(activeQuery);
  const categoryFilter = activeCategory.trim();

  const allCards = products.map((product) => toCardModel(product, categoriesBySlug, imagesByProductId));

  const filteredCards = allCards.filter((card) => {
    const matchesCategory = !categoryFilter || card.categorySlug === categoryFilter;
    if (!matchesCategory) return false;
    if (!query) return true;

    const haystack = normalize([card.title, card.line, card.spec, card.short, card.categoryLabel].join(" "));
    return haystack.includes(query);
  });

  const featuredProducts = allCards
    .filter((card) => card.tags.includes("topseller"))
    .sort((left, right) => {
      if (right.stockCount !== left.stockCount) {
        return right.stockCount - left.stockCount;
      }
      return left.priceCents - right.priceCents;
    })
    .slice(0, 8);

  const categoryShortcuts = categories.map((category) => {
    const categoryProducts = allCards.filter((card) => card.categorySlug === category.slug);
    const representative = categoryProducts.find((card) => card.tags.includes("topseller")) ?? categoryProducts[0];

    return {
      slug: category.slug,
      label: category.label,
      href: `/?category=${category.slug}`,
      productCount: categoryProducts.length,
      imageUrl: representative?.imageUrl ?? "/assets/reassurance/returns-support.png",
      imageAlt: representative?.imageAlt ?? category.label
    };
  });

  return {
    categories: categoryShortcuts,
    featuredProducts,
    searchResults: filteredCards,
    activeQuery,
    activeCategory,
    hasSearch: Boolean(activeQuery || activeCategory)
  };
}
