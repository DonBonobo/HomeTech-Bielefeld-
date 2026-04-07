import type {
  CategoryRow,
  ListingCategoryLink,
  ListingData,
  ListingMode,
  ProductCardModel
} from "@/lib/catalog/types";
import { buildProductCards, getCatalogRows } from "@/lib/catalog/catalog-store";
import { normalizeText, parseListingQuery, type ListingInput } from "@/lib/catalog/query";

function scoreSearch(card: ProductCardModel, query: string) {
  if (!query) return 0;

  const q = normalizeText(query);
  const title = normalizeText(card.title);
  const spec = normalizeText(card.spec);
  const line = normalizeText(card.line);
  const short = normalizeText(card.short);
  const category = normalizeText(card.categoryLabel);

  let score = 0;
  if (title === q) score += 120;
  if (title.startsWith(q)) score += 90;
  if (title.includes(q)) score += 60;
  if (line.includes(q)) score += 30;
  if (spec.includes(q)) score += 20;
  if (category.includes(q)) score += 16;
  if (short.includes(q)) score += 10;
  if (card.tags.includes("topseller")) score += 8;
  score += Math.min(card.stockCount, 40) / 10;

  return score;
}

function sortDefault(mode: ListingMode, query: string, products: ProductCardModel[]) {
  const sorted = [...products];

  if (mode === "search") {
    sorted.sort((left, right) => {
      const scoreDelta = scoreSearch(right, query) - scoreSearch(left, query);
      if (scoreDelta !== 0) return scoreDelta;
      if (right.stockCount !== left.stockCount) return right.stockCount - left.stockCount;
      return left.priceCents - right.priceCents;
    });
    return sorted;
  }

  sorted.sort((left, right) => {
    const featuredDelta = Number(right.tags.includes("topseller")) - Number(left.tags.includes("topseller"));
    if (featuredDelta !== 0) return featuredDelta;
    if (right.stockCount !== left.stockCount) return right.stockCount - left.stockCount;
    return left.priceCents - right.priceCents;
  });

  return sorted;
}

function buildCategoryLinks(
  categories: CategoryRow[],
  cards: ProductCardModel[],
  mode: ListingMode,
  activeQuery: string,
  activeCategory: string
): ListingCategoryLink[] {
  return categories.map((category) => {
    const count = cards.filter((card) => card.categorySlug === category.slug).length;
    const href =
      mode === "search"
        ? `/search?q=${encodeURIComponent(activeQuery)}&category=${encodeURIComponent(category.slug)}`
        : `/k/${category.slug}`;

    return {
      slug: category.slug,
      label: category.label,
      count,
      href,
      active: category.slug === activeCategory
    };
  });
}

export async function getListingData(mode: ListingMode, input: ListingInput): Promise<ListingData> {
  const { categories, products, productImages } = await getCatalogRows();
  const query = parseListingQuery(input);
  const allCards = buildProductCards(products, categories, productImages);
  const requestedCategory = mode === "category" ? query.category : query.category;
  const baseCards = allCards.filter((card) => {
    if (mode === "category" && requestedCategory) {
      return card.categorySlug === requestedCategory;
    }

    if (mode === "search" && query.q) {
      const haystack = normalizeText([card.title, card.line, card.spec, card.short, card.categoryLabel].join(" "));
      if (!haystack.includes(normalizeText(query.q))) return false;
    }

    return true;
  });

  const filteredCards =
    mode === "search" && query.category
      ? baseCards.filter((card) => card.categorySlug === query.category)
      : baseCards;

  const sortedCards =
    query.sort === "price-asc"
      ? [...filteredCards].sort((left, right) => left.priceCents - right.priceCents)
      : query.sort === "price-desc"
        ? [...filteredCards].sort((left, right) => right.priceCents - left.priceCents)
        : sortDefault(mode, query.q, filteredCards);

  const activeCategoryRow = query.category ? categories.find((category) => category.slug === query.category) : undefined;
  const categoryLinks = buildCategoryLinks(
    categories,
    mode === "search" && query.q ? baseCards : allCards,
    mode,
    query.q,
    query.category
  );

  const heading =
    mode === "category"
      ? activeCategoryRow?.label ?? "Kategorie"
      : query.q
        ? `Treffer für "${query.q}"`
        : "Suche";

  const subheading =
    mode === "category"
      ? "Lokal verfügbar, klar sortiert, direkt vergleichbar."
      : query.q
        ? "Ergebnisse aus dem gleichen kanonischen Lagerbestand wie Startseite und Kategorien."
        : "Direkter Zugriff auf den lokalen Lagerbestand.";

  const breadcrumbs =
    mode === "category"
      ? [
          { label: "Home", href: "/" },
          { label: activeCategoryRow?.label ?? "Kategorie", href: `/k/${query.category}` }
        ]
      : [
          { label: "Home", href: "/" },
          { label: "Suche", href: query.q ? `/search?q=${encodeURIComponent(query.q)}` : "/search" }
        ];

  return {
    mode,
    heading,
    subheading,
    breadcrumbs,
    products: sortedCards,
    total: sortedCards.length,
    activeQuery: query.q,
    activeCategory: query.category,
    activeCategoryLabel: activeCategoryRow?.label ?? "",
    sort: query.sort,
    categoryLinks,
    hasSearch: Boolean(query.q),
    hasCategoryFilter: Boolean(query.category),
    emptyState:
      mode === "search"
        ? "Keine Treffer gefunden. Versuche einen Hersteller, eine Größe oder wechsle direkt in eine Kategorie."
        : "In dieser Kategorie sind aktuell keine sichtbaren Produkte vorhanden."
  };
}
