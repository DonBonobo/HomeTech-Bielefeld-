import Image from "next/image";
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
      <div className={styles.media}>
        {isTopSeller ? <span className={styles.badge}>Top-Seller</span> : null}
        <Image
          src={product.imageUrl}
          alt={product.imageAlt}
          fill
          sizes="(min-width: 780px) 260px, 50vw"
          style={{ objectFit: "contain", padding: "12px" }}
        />
      </div>
      <div className={styles.meta}>
        <p className={styles.eyebrow}>
          {product.categoryLabel} · {product.line}
        </p>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.spec}>{product.spec}</p>
        <p className={styles.spec}>{product.short}</p>
      </div>
      <div className={styles.priceRow}>
        <span className={styles.price}>{formatEuro(product.priceCents)}</span>
        <span className={styles.vat}>inkl. 19% MwSt.</span>
      </div>
      <div className={styles.facts}>
        <span className={styles.stock}>{stockLabel(product.stockCount)}</span>
        <span>Bestand: {product.stockCount}</span>
        <span>Kostenlose Same-Day-Lieferung in Bielefeld</span>
      </div>
      <div className={styles.cta}>
        <button type="button" className={styles.button}>
          In den Warenkorb nach Login
        </button>
        <span className={styles.note}>Kauf-Einstieg vorhanden, Checkout/Auth folgt in eigener Slice.</span>
      </div>
    </article>
  );
}
