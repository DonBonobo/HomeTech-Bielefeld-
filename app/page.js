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
            <h2>Entdecke unsere Top-Produkte</h2>
            <p>Klare Karten, leise Signale und ein sichtbarer Set-Fortschritt fuer den naechsten Kauf.</p>
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
            <h2>Bestpreise, klare Lieferung, ruhiger Einkauf</h2>
            <p>Wenn du in Deutschland einen guenstigeren Haendler findest, versuchen wir den Preis fuer dich um 10% zu unterbieten.</p>
          </div>
          <a href="/sets" className="secondary-link">Sets & Sparoptionen</a>
        </div>
      </section>
    </div>
  );
}
