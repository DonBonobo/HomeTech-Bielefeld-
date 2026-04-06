"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/commerce";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { AuthEntryCard } from "@/components/shop/auth-entry-card";
import { ProductGallery } from "@/components/shop/product-gallery";
import { useStorefront } from "@/components/providers/storefront-provider";

export default function ProductPage() {
  const params = useParams();
  const { getProduct } = useStorefront();
  const product = getProduct(params.slug);
  if (!product) return null;

  return (
    <div className="page-stack">
      <section className="pdp-hero">
        <div className="pdp-breadcrumbs">
          <Link href="/">Startseite</Link>
          <span>/</span>
          <Link href={`/kategorie/${product.categorySlug}`}>{product.category}</Link>
          <span>/</span>
          <span>{product.title}</span>
        </div>
      </section>
      <section className="pdp-layout pdp-layout--refined">
        <ProductGallery title={product.title} gallery={product.gallery} />
        <div className="buy-card buy-card--refined">
          <p className="overline">{product.line}</p>
          <h1>{product.title}</h1>
          <strong className="big-price">{formatCurrency(product.priceCents)}</strong>
          <div className="pdp-status-row">
            <span className="pdp-status-pill">{product.stockLabel}</span>
            <span>{product.spec}</span>
          </div>
          <p>{product.short}</p>
          <div className="buy-info-list buy-info-list--compact">
            <span>Kompatibel mit</span>
            <div className="chip-row">
              {product.compatibility.map((entry) => (
                <span key={entry}>{entry}</span>
              ))}
            </div>
          </div>
          <div className="buy-info-list">
            <span>Kostenloser Versand ab 50 €</span>
            <span>30 Tage Rückgabe</span>
          </div>
          <div className="buy-actions">
            <AddToCartButton productId={product.id} />
            <Link href="/checkout" className="secondary-link">Warenkorb öffnen</Link>
          </div>
          <AuthEntryCard compact title="Anmelden" text="Zum Bezahlen bitte anmelden." />
        </div>
      </section>
    </div>
  );
}
