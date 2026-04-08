import { notFound } from "next/navigation";
import { ProductPage } from "@/components/product/product-page";
import { getProductData } from "@/lib/catalog/get-product-data";

type ProductRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductRoute({ params }: ProductRouteProps) {
  const { slug } = await params;
  const { product, relatedProducts, categoryLinks } = await getProductData(slug);

  if (!product) {
    notFound();
  }

  return <ProductPage product={product} relatedProducts={relatedProducts} categoryLinks={categoryLinks} />;
}
