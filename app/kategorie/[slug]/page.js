import { notFound } from "next/navigation";
import { getCategoryProducts, categories } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/product-card";
import { SetProgress } from "@/components/shop/set-progress";
import Link from "next/link";

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = categories.find((entry) => entry.slug === slug);
  if (!category || slug === "sets") {
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
            <h1>Launch-Auswahl fuer ruhiges Vergleichen</h1>
            <p>Nur die aktuellen Hue-Produkte, die wir jetzt wirklich starten. Klar lesbar, schnell vergleichbar und direkt fuer dein Set geeignet.</p>
          </div>
          <div className="chip-row">
            <span>Qualifizierend fuer den Set-Rabatt</span>
            <span>{items.length} Produkte</span>
          </div>
        </div>
      </section>
      <SetProgress compact ctaHref="/checkout" ctaLabel="Warenkorb pruefen" />
      <section className="section-block section-block--tight">
        <div className="section-toolbar">
          <span>Sortiert nach Launch-Relevanz</span>
          <span>Alle Produkte sind set-faehig</span>
        </div>
        <div className="storefront-grid">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
