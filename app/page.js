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
            <p>Wenige gute Produkte, klare Preise und ein sichtbarer Set-Fortschritt fuer den naechsten Schritt.</p>
          </div>
        </div>
        <div className="product-rail">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-block section-block--soft">
        <div className="section-header">
          <div>
            <p className="overline">Service</p>
            <h2>Klar kuratiert fuer den Launch</h2>
            <p>Wir starten mit einer bewusst kleinen Hue-Auswahl. So bleibt der Shop ruhig, vergleichbar und fuer Sets leichter planbar.</p>
          </div>
          <a href="/sets" className="secondary-link">Sets & Sparoptionen</a>
        </div>
      </section>
    </div>
  );
}
