"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/commerce";
import { ProductCard } from "@/components/shop/product-card";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { AuthEntryCard } from "@/components/shop/auth-entry-card";
import { useStorefront } from "@/components/providers/storefront-provider";

export default function ProductPage() {
  const params = useParams();
  const { getProduct, visibleProducts } = useStorefront();
  const product = getProduct(params.slug);
  if (!product) return null;

  const related = visibleProducts.filter((item) => item.id !== product.id).slice(0, 3);

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
        <div className="media-card media-card--stage">
          <div className="media-stage-glow" />
          <Image src={product.gallery[0]} alt={product.title} width={720} height={720} />
          {product.gallery.length > 1 ? (
            <div className="pdp-thumb-row">
              {product.gallery.slice(0, 3).map((image) => (
                <div key={image} className="pdp-thumb">
                  <Image src={image} alt="" width={120} height={120} />
                </div>
              ))}
            </div>
          ) : (
            <div className="pdp-stage-note">Originale Verpackung, klar fotografiert und direkt vergleichbar.</div>
          )}
        </div>
        <div className="buy-card buy-card--refined">
          <p className="overline">{product.line}</p>
          <h1>{product.title}</h1>
          <strong className="big-price">{formatCurrency(product.priceCents)}</strong>
          <div className="chip-row">
            <span>{product.spec}</span>
            <span>{product.stockLabel}</span>
          </div>
          <p>{product.description}</p>
          <div className="trust-list">
            <span>PayPal</span>
            <span>Versand in ganz Europa</span>
            <span>30 Tage Rückgabe</span>
          </div>
          <div className="buy-actions">
            <AddToCartButton productId={product.id} />
            <Link href="/checkout" className="secondary-link">Zum Warenkorb</Link>
          </div>
          <AuthEntryCard compact />
        </div>
      </section>
      <section className="section-block section-block--soft">
        <div className="section-header">
          <div>
            <p className="overline">Produktdetails</p>
            <h2>Klar aufgebaut statt ueberladen</h2>
            <p>Kompatibilität, Lieferung und Rückgabe bleiben sichtbar, ohne die Kaufentscheidung unnötig aufzublasen.</p>
          </div>
        </div>
        <div className="pdp-details-grid">
          <ul className="detail-bullets">
            <li>Kompatibel mit gängigen Hue- und Smart-Home-Setups</li>
            <li>Schnelle Einrichtung per App und alltagstaugliche Steuerung</li>
            <li>Versand innerhalb Europas und 30 Tage Rückgabe</li>
          </ul>
          <div className="chip-row">
            {product.compatibility.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
      </section>
      <section className="section-block section-block--tight">
        <div className="section-header">
          <div>
            <p className="overline">Passend dazu</p>
            <h2>Weitere passende Produkte</h2>
          </div>
        </div>
        <div className="storefront-grid storefront-grid--related">
          {related.map((item) => <ProductCard key={item.id} product={item} />)}
        </div>
      </section>
    </div>
  );
}
