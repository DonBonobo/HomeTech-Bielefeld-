import { buildProductDetails, getCatalogRows } from "@/lib/catalog/catalog-store";
import type { ProductDetailModel } from "@/lib/catalog/types";

export async function getProductData(slug: string): Promise<{
  product: ProductDetailModel | null;
  relatedProducts: ProductDetailModel[];
  categoryLinks: Array<{ slug: string; label: string; href: string; count: number; active: boolean }>;
}> {
  const { categories, products, productImages } = await getCatalogRows();
  const allProducts = buildProductDetails(products, categories, productImages);
  const product = allProducts.find((entry) => entry.slug === slug) ?? null;
  const categoryLinks = categories.map((category) => ({
    slug: category.slug,
    label: category.label,
    href: `/k/${category.slug}`,
    count: allProducts.filter((entry) => entry.categorySlug === category.slug).length,
    active: category.slug === product?.categorySlug
  }));

  if (!product) {
    return {
      product: null,
      relatedProducts: [],
      categoryLinks
    };
  }

  const relatedProducts = allProducts
    .filter((entry) => entry.categorySlug === product.categorySlug && entry.id !== product.id)
    .slice(0, 4);

  return {
    product,
    relatedProducts,
    categoryLinks
  };
}
