import { seedCategories, seedProducts } from "@/lib/storefront-seed";

export const categories = seedCategories;
export const products = seedProducts;

export function getProduct(slug, items = products) {
  return items.find((product) => product.slug === slug) || null;
}

export function getCategory(slug, items = categories) {
  return items.find((category) => category.slug === slug) || null;
}

export function getCategoryProducts(slug, items = products) {
  return items.filter((product) => product.visible !== false && product.categorySlug === slug);
}
