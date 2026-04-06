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
      <section className="section-block section-block--soft">
        <div className="pdp-breadcrumbs">
          <Link href="/">Startseite</Link>
          <span>/</span>
          <span>{category.label}</span>
        </div>
        <div className="section-header">
          <div>
            <p className="overline">{category.label}</p>
            <h1>Gezielt einkaufen statt unruhig browsen</h1>
            <p>Klare Karten, klare CTAs und ein sichtbarer Set-Fortschritt fuer den naechsten Kauf.</p>
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
          <span>Sortiert nach Beliebtheit</span>
          <span>Klare Auswahl fuer dein Set</span>
        </div>
        <div className="listing-grid">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
