import { notFound } from "next/navigation";
import { getCategoryProducts, categories } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/product-card";
import { SetProgress } from "@/components/shop/set-progress";

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = categories.find((entry) => entry.slug === slug);
  if (!category || slug === "sets") {
    notFound();
  }

  const items = getCategoryProducts(slug);

  return (
    <div className="page-stack">
      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="overline">{category.label}</p>
            <h1>Gezielt einkaufen statt unruhig browsen</h1>
            <p>Klare Karten, klare CTAs und ein sichtbarer Set-Fortschritt fuer den naechsten Kauf.</p>
          </div>
        </div>
      </section>
      <SetProgress compact ctaHref="/checkout" ctaLabel="Warenkorb pruefen" />
      <section className="product-grid">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </div>
  );
}
