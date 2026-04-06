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
            <h2>Die aktuelle Launch-Auswahl</h2>
            <p>Wenige Hue-Produkte, direkt kaufbar und sauber inszeniert.</p>
          </div>
        </div>
        <div className="storefront-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-block section-block--soft launch-note">
        <div className="section-header">
          <div>
            <p className="overline">Service</p>
            <h2>Originale Produkte. Klare Informationen. Schneller Abschluss.</h2>
            <p>Originale Produktbilder, kompakte Produktseiten und PayPal als klarer Zahlungsweg zum Start.</p>
          </div>
          <a href="/kategorie/leuchtmittel" className="secondary-link">Alle Leuchtmittel</a>
        </div>
      </section>
    </div>
  );
}
