export const listingSortOptions = ["default", "price-asc", "price-desc"] as const;

export type ListingSort = (typeof listingSortOptions)[number];

export type ListingInput = {
  q?: string;
  category?: string;
  sort?: string;
};

export type ListingQuery = {
  q: string;
  category: string;
  sort: ListingSort;
};

function isListingSort(value: string): value is ListingSort {
  return (listingSortOptions as readonly string[]).includes(value);
}

export function normalizeText(text: string) {
  return text.trim().toLocaleLowerCase("de-DE");
}

export function parseListingQuery(input: ListingInput): ListingQuery {
  return {
    q: input.q?.trim() ?? "",
    category: input.category?.trim() ?? "",
    sort: input.sort && isListingSort(input.sort) ? input.sort : "default"
  };
}
