"use client";

import { HomeHero } from "@/components/shop/home-hero";
import { ProductCard } from "@/components/shop/product-card";
import { TrustStrip } from "@/components/shop/trust-strip";
import { useStorefront } from "@/components/providers/storefront-provider";

export default function HomePage() {
  const { visibleProducts } = useStorefront();

  return (
    <div className="page-stack">
      <HomeHero />
      <section className="section-block section-block--tight">
        <div className="section-header">
          <div>
            <p className="overline">Unsere Bestseller</p>
            <h2>Beliebte Leuchtmittel</h2>
            <p>Direkt auswahlen und in den Warenkorb legen.</p>
          </div>
        </div>
        <div className="storefront-list">
          {visibleProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} variant="compact" />
          ))}
        </div>
      </section>
      <TrustStrip />
    </div>
  );
}
