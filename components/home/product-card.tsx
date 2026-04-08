import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import styles from "@/components/home/product-card.module.css";
import { formatEuro } from "@/lib/format";
import type { ProductCardModel } from "@/lib/catalog/types";

function stockLabel(stockCount: number) {
  if (stockCount >= 20) return "Sofort lagernd";
  if (stockCount >= 10) return "Wenig Aufwand, lokal auf Lager";
  return "Niedriger Bestand, heute noch verfügbar";
}

export function ProductCard({ product }: { product: ProductCardModel }) {
  const isTopSeller = product.tags.includes("topseller");

  return (
    <article className={styles.card}>
      <Link href={`/p/${product.slug}`} className={styles.media}>
        {isTopSeller ? <span className={styles.badge}>Top-Seller</span> : null}
        <Image
          className={styles.mediaImage}
          src={product.imageUrl}
          alt={product.imageAlt}
          fill
          sizes="(min-width: 780px) 260px, 50vw"
          style={{ objectFit: "contain" }}
        />
      </Link>
      <div className={styles.meta}>
        <p className={styles.eyebrow}>
          {product.categoryLabel} · {product.line}
        </p>
        <h3 className={styles.title}>
          <Link href={`/p/${product.slug}`}>{product.title}</Link>
        </h3>
        <p className={styles.spec}>{product.spec}</p>
        <p className={styles.copy}>{product.short}</p>
      </div>
      <div className={styles.priceRow}>
        <span className={styles.price}>{formatEuro(product.priceCents)}</span>
        <span className={styles.vat}>inkl. 19% MwSt.</span>
      </div>
      <div className={styles.facts}>
        <span className={styles.stock}>{stockLabel(product.stockCount)}</span>
        <span>Bestand: {product.stockCount}</span>
        <span>Lieferung heute in Bielefeld</span>
      </div>
      <div className={styles.cta}>
        <AddToCartButton
          className={styles.button}
          product={{
            productId: product.id,
            slug: product.slug,
            title: product.title,
            categoryLabel: product.categoryLabel,
            spec: product.spec,
            priceCents: product.priceCents,
            imageUrl: product.imageUrl,
            stockCount: product.stockCount
          }}
        />
      </div>
    </article>
  );
}
