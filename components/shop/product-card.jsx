"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/commerce";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";

export function ProductCard({ product, variant = "grid" }) {
  return (
    <article className={`product-card product-card--${variant}`}>
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
      <AddToCartButton productId={product.id} />
    </article>
  );
}
