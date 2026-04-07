import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/home/site-header";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import styles from "@/components/product/product-page.module.css";
import { formatEuro } from "@/lib/format";
import type { ProductDetailModel } from "@/lib/catalog/types";

function stockLabel(stockCount: number) {
  if (stockCount >= 20) return "Sofort lagernd";
  if (stockCount >= 10) return "Lokal auf Lager";
  return "Kleiner Bestand, heute verfügbar";
}

export function ProductPage({
  product,
  relatedProducts
}: {
  product: ProductDetailModel;
  relatedProducts: ProductDetailModel[];
}) {
  return (
    <main className={styles.page}>
      <SiteHeader />

      <div className={styles.breadcrumbs}>
        <Link href="/">Home</Link>
        <span>·</span>
        <Link href={`/k/${product.categorySlug}`}>{product.categoryLabel}</Link>
        <span>·</span>
        <span>{product.title}</span>
      </div>

      <section className={styles.layout}>
        <div className={styles.gallery}>
          <div className={styles.galleryMain}>
            <Image src={product.imageUrl} alt={product.imageAlt} fill sizes="(min-width: 780px) 60vw, 100vw" style={{ objectFit: "contain", padding: "24px" }} />
          </div>
          <div className={styles.thumbRow}>
            {product.gallery.slice(0, 4).map((imageUrl) => (
              <div key={imageUrl} className={styles.thumb}>
                <Image src={imageUrl} alt={product.title} fill sizes="120px" style={{ objectFit: "contain", padding: "10px" }} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.buyCard}>
          <p className={styles.overline}>
            {product.categoryLabel} · {product.line}
          </p>
          <h1 className={styles.title}>{product.title}</h1>
          <p className={styles.metaText}>{product.spec}</p>
          <p className={styles.description}>{product.description}</p>

          <div className={styles.priceRow}>
            <span className={styles.price}>{formatEuro(product.priceCents)}</span>
            <span className={styles.metaText}>inkl. 19% MwSt.</span>
          </div>

          <div className={styles.factList}>
            <span className={styles.stock}>{stockLabel(product.stockCount)}</span>
            <span>Bestand: {product.stockCount}</span>
            <span>Kostenlose Same-Day-Lieferung in Bielefeld</span>
            <span>Finaler Abschluss als ehrliche Bestellanfrage, solange Zahlung noch nicht live ist.</span>
          </div>

          <div className={styles.actions}>
            <AddToCartButton
              className={styles.addButton}
              product={{
                productId: product.id,
                slug: product.slug,
                title: product.title,
                categoryLabel: product.categoryLabel,
                spec: product.spec,
                priceCents: product.priceCents,
                imageUrl: product.imageUrl
              }}
            />
            <Link href="/cart" className={styles.secondaryLink}>
              Warenkorb öffnen
            </Link>
          </div>
        </div>
      </section>

      {relatedProducts.length ? (
        <section className={styles.section}>
          <h2 style={{ marginTop: 0 }}>Passend aus derselben Kategorie</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((entry) => (
              <Link key={entry.id} href={`/p/${entry.slug}`} className={styles.relatedCard}>
                <div className={styles.relatedMedia}>
                  <Image src={entry.imageUrl} alt={entry.imageAlt} fill sizes="220px" style={{ objectFit: "contain", padding: "12px" }} />
                </div>
                <div>
                  <strong>{entry.title}</strong>
                  <p className={styles.metaText}>{entry.spec}</p>
                  <p className={styles.metaText}>{formatEuro(entry.priceCents)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
