"use client";

import { useParams } from "next/navigation";
import { ProductCard } from "@/components/shop/product-card";
import Link from "next/link";
import { useStorefront } from "@/components/providers/storefront-provider";
import { CategoryShortcuts } from "@/components/shop/category-shortcuts";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug;
  const { getCategory, getCategoryProducts } = useStorefront();
  const category = getCategory(slug);
  const items = category ? getCategoryProducts(slug) : [];

  return (
    <div className="page-stack">
      <section className="section-block section-block--soft listing-intro listing-intro--refined">
        <div className="pdp-breadcrumbs">
          <Link href="/">Startseite</Link>
          <span>/</span>
          <span>{category?.label || "Kategorie"}</span>
        </div>
        <div className="section-header">
          <div>
            <p className="overline">{category?.label || "Kategorie"}</p>
            <h1>{category?.enabled ? category.label : `${category?.label || "Diese Kategorie"} folgt später`}</h1>
            <p>
              {category?.enabled
                ? "Originale Produkte, ruhig sortiert."
                : "Diese Kategorie wird mit Produkten gefüllt."}
            </p>
          </div>
        </div>
        <CategoryShortcuts compact />
      </section>
      <section className="section-block section-block--tight">
        <div className="catalog-shell">
          <aside className="filter-panel">
            <div className="section-toolbar">
              <strong>Filter</strong>
            </div>
            <div className="filter-list">
              <button type="button" className="filter-pill is-active">Alle</button>
              <button type="button" className="filter-pill">Philips Hue</button>
              <button type="button" className="filter-pill">Bluetooth</button>
              <button type="button" className="filter-pill">Matter</button>
            </div>
          </aside>
          <div className="catalog-content">
            <div className="section-toolbar catalog-toolbar">
              <span>{category?.enabled ? "Beliebte Auswahl" : "Noch keine Produkte verfügbar"}</span>
              <span>{items.length} Produkte</span>
            </div>
        {items.length ? (
          <div className="storefront-grid storefront-grid--catalog">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} variant="catalog" />
            ))}
          </div>
        ) : (
          <article className="section-block section-block--soft empty-state-card">
            <div className="section-header">
              <div>
                <p className="overline">Bald verfügbar</p>
                <h2>Aktuell findest du hier noch keine Produkte.</h2>
                <p>Diese Kategorie bleibt vorbereitet und wird aktiviert, sobald Produkte hinterlegt sind.</p>
              </div>
              <Link href="/kategorie/leuchtmittel" className="primary-link">Zu den Leuchtmitteln</Link>
            </div>
          </article>
        )}
          </div>
        </div>
      </section>
    </div>
  );
}
