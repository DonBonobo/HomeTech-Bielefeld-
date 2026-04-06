"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/commerce";
import { useCart } from "@/components/providers/cart-provider";

export function ProductCard({ product }) {
  const { addItem, progress } = useCart();
  const nextStep = progress.unlocked ? "Set-Rabatt aktiv" : `${Math.max(1, progress.itemsNeeded)} von 4 zum Rabatt hinzufuegen`;

  return (
    <article className="product-card">
      <Link href={`/produkt/${product.slug}`} className="product-card-link">
        <div className="product-image-frame">
          <Image src={product.image} alt={product.title} width={420} height={420} />
        </div>
        <div className="product-copy">
          <p className="overline">{product.category}</p>
          <h3>{product.title}</h3>
          <p>{product.short}</p>
        </div>
      </Link>
      <div className="product-meta-row">
        <strong>{formatCurrency(product.priceCents)}</strong>
        <span>{product.stockLabel}</span>
      </div>
      <div className="chip-row">
        <span>Set-Rabatt faehig</span>
        <span>{product.compatibility[0]}</span>
      </div>
      <div className="product-progress-hint">{nextStep}</div>
      <button type="button" className="primary-action" onClick={() => addItem(product.id)}>
        In den Warenkorb
      </button>
    </article>
  );
}
