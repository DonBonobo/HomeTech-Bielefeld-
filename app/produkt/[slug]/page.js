import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/catalog";
import { formatCurrency } from "@/lib/commerce";
import { SetProgress } from "@/components/shop/set-progress";
import { ProductCard } from "@/components/shop/product-card";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) {
    notFound();
  }

  const related = products.filter((item) => item.id !== product.id).slice(0, 3);

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
            <div className="pdp-stage-note">Originale Launch-Verpackung, klar fotografiert und direkt vergleichbar.</div>
          )}
        </div>
        <div className="buy-card buy-card--refined">
          <p className="overline">{product.category}</p>
          <h1>{product.title}</h1>
          <strong className="big-price">{formatCurrency(product.priceCents)}</strong>
          <div className="chip-row">
            <span>Set-Rabatt faehig</span>
            <span>{product.stockLabel}</span>
          </div>
          <p>{product.description}</p>
          <div className="set-inline-card">
            <span>20% Set-Rabatt ab 4 passenden Hue-Produkten</span>
            <strong>Einfach kombinieren</strong>
          </div>
          <div className="trust-list">
            <span>PayPal zum Launch</span>
            <span>Versand in ganz Europa</span>
            <span>30 Tage Rueckgabe</span>
          </div>
          <div className="buy-actions">
            <AddToCartButton productId={product.id} />
            <Link href="/sets" className="secondary-link">Set-Vorteil nutzen</Link>
          </div>
        </div>
      </section>
      <SetProgress compact ctaHref="/checkout" ctaLabel="Set im Warenkorb pruefen" />
      <section className="section-block section-block--soft">
        <div className="section-header">
          <div>
            <p className="overline">Produktdetails</p>
            <h2>Schnell scanbar statt versteckt</h2>
            <p>Klare Kompatibilitaet, planbare Lieferung und ein ruhiger Weg zur passenden Kombination.</p>
          </div>
        </div>
        <div className="pdp-details-grid">
          <ul className="detail-bullets">
            <li>Fuer Hue Bridge, Matter und gaengige Smart-Home-Setups</li>
            <li>Schnelle Einrichtung und klare Alltagstauglichkeit</li>
            <li>Versand in ganz Europa</li>
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
            <h2>Ein Produkt mehr bringt dich naeher zum Set</h2>
          </div>
        </div>
        <div className="storefront-grid storefront-grid--related">
          {related.map((item) => <ProductCard key={item.id} product={item} />)}
        </div>
      </section>
    </div>
  );
}
