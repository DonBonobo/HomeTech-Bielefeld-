"use client";

import { useParams } from "next/navigation";
import { ProductCard } from "@/components/shop/product-card";
import Link from "next/link";
import { useStorefront } from "@/components/providers/storefront-provider";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug;
  const { getCategory, getCategoryProducts } = useStorefront();
  const category = getCategory(slug);
  const items = category ? getCategoryProducts(slug) : [];

  return (
    <div className="page-stack">
      <section className="section-block section-block--soft listing-intro">
        <div className="pdp-breadcrumbs">
          <Link href="/">Startseite</Link>
          <span>/</span>
          <span>{category?.label || "Kategorie"}</span>
        </div>
        <div className="section-header">
          <div>
            <p className="overline">{category?.label || "Kategorie"}</p>
            <h1>{category?.enabled ? `${category.label} für dein Zuhause` : `${category?.label || "Diese Kategorie"} folgt später`}</h1>
            <p>
              {category?.enabled
                ? "Eine bewusst kleine Auswahl: klare Produkte, ruhige Karten und direkte Kaufwege."
                : "Aktuell konzentriert sich der Shop auf Philips Hue Leuchtmittel. Schalter und Hubs werden danach sauber ergänzt."}
            </p>
          </div>
        </div>
      </section>
      <section className="section-block section-block--tight">
        <div className="section-toolbar">
          <span>{category?.enabled ? "Kuratierte Auswahl" : "Noch keine Produkte verfügbar"}</span>
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
                <h2>Aktuell findest du hier noch keine Produkte.</h2>
                <p>Schalter und Hubs bekommen eine eigene, genauso ruhige Auswahl, sobald diese Bereiche befüllt sind.</p>
              </div>
              <Link href="/kategorie/leuchtmittel" className="primary-link">Zu den Leuchtmitteln</Link>
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
