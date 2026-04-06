import { CategoryChipRow } from "@/components/shop/category-chip-row";
import { HomeHero } from "@/components/shop/home-hero";
import { ProductCard } from "@/components/shop/product-card";
import { SetProgress } from "@/components/shop/set-progress";
import { TrustStrip } from "@/components/shop/trust-strip";
import { products, categories } from "@/lib/catalog";

export default function HomePage() {
  return (
    <div className="page-stack">
      <HomeHero />

      <TrustStrip />

      <SetProgress compact ctaLabel="Zum Set-Vorteil" />

      <CategoryChipRow categories={categories} />

      <section className="section-block section-block--tight">
        <div className="section-header">
          <div>
            <p className="overline">Top-Produkte</p>
            <h2>Die aktuelle Launch-Auswahl</h2>
            <p>Eine kleine, echte Hue-Auswahl fuer den Start. Klar vergleichbar, ruhig praesentiert und direkt set-faehig.</p>
          </div>
        </div>
        <div className="storefront-grid">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-block section-block--soft launch-note">
        <div className="section-header">
          <div>
            <p className="overline">Service</p>
            <h2>Klar kuratiert fuer den Launch</h2>
            <p>Wir starten bewusst klein. So bleibt der Shop ruhig, die Auswahl nachvollziehbar und der 4er-Set-Rabatt wirklich hilfreich.</p>
          </div>
          <a href="/kategorie/leuchtmittel" className="secondary-link">Alle Leuchtmittel</a>
        </div>
      </section>
    </div>
  );
}
