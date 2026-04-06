"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/commerce";
import { useCart } from "@/components/providers/cart-provider";

export function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <article className="product-card">
      <Link href={`/produkt/${product.slug}`} className="product-card-link">
        <div className="product-image-frame">
          <Image src={product.image} alt={product.title} width={420} height={420} />
        </div>
        <div className="product-copy">
          <p className="overline">{product.line}</p>
          <h3>{product.title}</h3>
          <p>{product.short}</p>
        </div>
      </Link>
      <div className="product-meta-row">
        <strong>{formatCurrency(product.priceCents)}</strong>
        <span>{product.stockLabel}</span>
      </div>
      <div className="chip-row">
        <span>{product.spec}</span>
        <span>{product.compatibility[0]}</span>
      </div>
      <button type="button" className="primary-action" onClick={() => addItem(product.id)}>
        In den Warenkorb
      </button>
    </article>
  );
}
