import { ProductCard } from "@/components/shop/product-card";
import { SetProgress } from "@/components/shop/set-progress";
import { TrustStrip } from "@/components/shop/trust-strip";
import { products, categories } from "@/lib/catalog";

export default function HomePage() {
  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="overline">HomeTech Bielefeld</p>
          <h1>Smart-Home Zubehoer mit Stil, Klarheit und schneller Lieferung.</h1>
          <p>Der Shop ist jetzt auf einen klaren mobilen Weg gebaut: entdecken, adden, Set sammeln, sicher auschecken.</p>
          <div className="hero-actions">
            <a href="/kategorie/leuchtmittel" className="primary-link">Jetzt entdecken</a>
            <a href="/sets" className="secondary-link">Zum Set-Vorteil</a>
          </div>
        </div>
        <div className="hero-visual-grid">
          <img src="/assets/products/philips-hue-smart-plug.png" alt="Smart Plug" />
          <img src="/assets/products/philips-hue-white-ambiance-gu10.png" alt="Hue GU10" />
          <img src="/assets/products/philips-hue-wall-switch-module.png" alt="Wall Switch Module" />
        </div>
      </section>

      <TrustStrip />

      <SetProgress />

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="overline">Schnelle Einstiege</p>
            <h2>Buy the product. Collect your set.</h2>
          </div>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <a key={category.slug} className="category-card" href={category.slug === "sets" ? "/sets" : `/kategorie/${category.slug}`}>
              <strong>{category.label}</strong>
              <span>{category.slug === "sets" ? "20% sparen ab 4 Artikeln" : "Kuratiert fuer den schnellen Einkauf"}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="promo-grid">
        <article className="promo-card">
          <strong>20% auf 4 qualifizierende Produkte</strong>
          <p>Die Set-Logik laeuft durchgehend mit: auf der Startseite, in der Kategorie, auf dem Produkt und im Checkout.</p>
          <a href="/sets" className="primary-link">Sets ansehen</a>
        </article>
        <article className="promo-card">
          <strong>Bestpreis-Garantie</strong>
          <p>Wenn du in Deutschland einen guenstigeren Haendler findest, versuchen wir den Preis fuer dich um 10% zu unterbieten.</p>
          <a href="/checkout" className="secondary-link">Zum Warenkorb</a>
        </article>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="overline">Sofort kaufbar</p>
            <h2>Beliebte Produkte fuer dein Set</h2>
            <p>Ein klarer Raster fuer den mobilen Einstieg: Produkt ansehen, adden, Set aufbauen.</p>
          </div>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
