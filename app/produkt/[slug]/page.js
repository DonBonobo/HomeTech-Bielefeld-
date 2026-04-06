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
      <section className="pdp-layout">
        <div className="media-card">
          <Image src={product.gallery[0]} alt={product.title} width={720} height={720} />
        </div>
        <div className="buy-card">
          <p className="overline">{product.category}</p>
          <h1>{product.title}</h1>
          <strong className="big-price">{formatCurrency(product.priceCents)}</strong>
          <div className="chip-row">
            <span>Set-Rabatt faehig</span>
            <span>{product.stockLabel}</span>
          </div>
          <p>{product.description}</p>
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
      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="overline">Kompatibilitaet</p>
            <h2>Schnell scanbar statt versteckt</h2>
          </div>
        </div>
        <div className="chip-row">
          {product.compatibility.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>
      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="overline">Passend dazu</p>
            <h2>Ein Produkt mehr bringt dich naeher zum Set</h2>
          </div>
        </div>
        <div className="product-grid">
          {related.map((item) => <ProductCard key={item.id} product={item} />)}
        </div>
      </section>
    </div>
  );
}
