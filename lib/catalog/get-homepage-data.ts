import type { HomepageData } from "@/lib/catalog/types";
import { buildProductCards, getCatalogRows } from "@/lib/catalog/catalog-store";
import { normalizeText, parseListingQuery } from "@/lib/catalog/query";

type Filters = {
  q?: string;
  category?: string;
};

export async function getHomepageData(filters: Filters): Promise<HomepageData> {
  const { categories, products, productImages } = await getCatalogRows();
  const query = parseListingQuery(filters);
  const allCards = buildProductCards(products, categories, productImages);

  const filteredCards = allCards.filter((card) => {
    const matchesCategory = !query.category || card.categorySlug === query.category;
    if (!matchesCategory) return false;
    if (!query.q) return true;

    const haystack = normalizeText([card.title, card.line, card.spec, card.short, card.categoryLabel].join(" "));
    return haystack.includes(normalizeText(query.q));
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
      href: `/k/${category.slug}`,
      productCount: categoryProducts.length,
      imageUrl: representative?.imageUrl ?? "/assets/reassurance/returns-support.png",
      imageAlt: representative?.imageAlt ?? category.label
    };
  });

  return {
    categories: categoryShortcuts,
    featuredProducts,
    searchResults: filteredCards,
    activeQuery: query.q,
    activeCategory: query.category,
    hasSearch: Boolean(query.q || query.category)
  };
}
