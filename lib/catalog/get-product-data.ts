import { buildProductDetails, getCatalogRows } from "@/lib/catalog/catalog-store";
import type { ProductDetailModel } from "@/lib/catalog/types";

export async function getProductData(slug: string): Promise<{
  product: ProductDetailModel | null;
  relatedProducts: ProductDetailModel[];
}> {
  const { categories, products, productImages } = await getCatalogRows();
  const allProducts = buildProductDetails(products, categories, productImages);
  const product = allProducts.find((entry) => entry.slug === slug) ?? null;

  if (!product) {
    return {
      product: null,
      relatedProducts: []
    };
  }

  const relatedProducts = allProducts
    .filter((entry) => entry.categorySlug === product.categorySlug && entry.id !== product.id)
    .slice(0, 4);

  return {
    product,
    relatedProducts
  };
}
