import { HomeHero } from "@/components/shop/home-hero";
import { ProductCard } from "@/components/shop/product-card";
import { TrustStrip } from "@/components/shop/trust-strip";
import { products } from "@/lib/catalog";

export default function HomePage() {
  return (
    <div className="page-stack">
      <HomeHero />

      <TrustStrip />

      <section className="section-block section-block--tight">
        <div className="section-header">
          <div>
            <p className="overline">Unsere Bestseller</p>
            <h2>Beliebte Leuchtmittel</h2>
            <p>Originale Hue Produkte, ruhig praesentiert und direkt bestellbar.</p>
          </div>
        </div>
        <div className="storefront-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-block section-block--soft service-note">
        <div className="section-header">
          <div>
            <p className="overline">Service</p>
            <h2>Originale Produkte. Klare Informationen. Sicher bezahlen.</h2>
            <p>Originale Produktbilder, kompakte Produktseiten und PayPal als direkter Zahlungsweg.</p>
          </div>
          <a href="/kategorie/leuchtmittel" className="secondary-link">Alle Leuchtmittel</a>
        </div>
      </section>
    </div>
  );
}
