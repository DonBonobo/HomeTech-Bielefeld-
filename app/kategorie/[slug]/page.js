import { notFound } from "next/navigation";
import { getCategoryProducts, categories } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/product-card";
import Link from "next/link";

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = categories.find((entry) => entry.slug === slug);
  if (!category) {
    notFound();
  }

  const items = getCategoryProducts(slug);

  return (
    <div className="page-stack">
      <section className="section-block section-block--soft listing-intro">
        <div className="pdp-breadcrumbs">
          <Link href="/">Startseite</Link>
          <span>/</span>
          <span>{category.label}</span>
        </div>
        <div className="section-header">
          <div>
            <p className="overline">{category.label}</p>
            <h1>{category.enabled ? "Leuchtmittel fuer den Launch" : `${category.label} folgen spaeter`}</h1>
            <p>
              {category.enabled
                ? "Die aktuelle Auswahl ist bewusst klein: klare Produkte, ruhige Karten und direkte Kaufwege."
                : "Zum Start konzentriert sich der Shop auf Philips Hue Leuchtmittel. Schalter und Hubs werden danach sauber ergaenzt."}
            </p>
          </div>
        </div>
      </section>
      <section className="section-block section-block--tight">
        <div className="section-toolbar">
          <span>{category.enabled ? "Kuratierte Launch-Auswahl" : "Noch keine Produkte verfuegbar"}</span>
          <span>{items.length} Produkte</span>
        </div>
        {items.length ? (
          <div className="storefront-grid">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <article className="section-block section-block--soft empty-state-card">
            <div className="section-header">
              <div>
                <p className="overline">Bald verfuegbar</p>
                <h2>Aktuell startet HomeTech mit Leuchtmitteln.</h2>
                <p>Schalter und Hubs bekommen eine eigene, genauso ruhige Auswahl sobald die ersten Produkte live sind.</p>
              </div>
              <Link href="/kategorie/leuchtmittel" className="primary-link">Zu den Leuchtmitteln</Link>
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
