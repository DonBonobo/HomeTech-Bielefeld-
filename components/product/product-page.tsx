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
  relatedProducts,
  categoryLinks
}: {
  product: ProductDetailModel;
  relatedProducts: ProductDetailModel[];
  categoryLinks: Array<{ slug: string; label: string; href: string; count: number; active: boolean }>;
}) {
  return (
    <main className={styles.page}>
      <div className={styles.stack}>
        <SiteHeader />

        <section className={styles.searchShell}>
          <div className={styles.breadcrumbs}>
            <Link href="/">Home</Link>
            <span>›</span>
            <Link href={`/k/${product.categorySlug}`}>{product.categoryLabel}</Link>
            <span>›</span>
            <span>{product.title}</span>
          </div>

          <form className={styles.searchForm} action="/search" method="get">
            <input
              className={styles.searchInput}
              type="search"
              name="q"
              defaultValue={product.title.split(" ")[0]}
              placeholder="Search for screws, anchors, adhesives, etc..."
              aria-label="Produkte durchsuchen"
            />
            <button className={styles.searchButton} type="submit">
              Search
            </button>
          </form>
        </section>

        <section className={styles.layout}>
          <aside className={styles.sidebar}>
            <section className={styles.panel}>
              <h2>Filter</h2>
              <p>Dieselben Kategorien wie in Suche und Listing.</p>
              <div className={styles.categoryList}>
                {categoryLinks.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={entry.href}
                    className={`${styles.categoryLink} ${entry.active ? styles.categoryLinkActive : ""}`.trim()}
                  >
                    <span>{entry.label}</span>
                    <span>{entry.count}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <h3>Lieferung in Bielefeld</h3>
              <p>Kostenlos am selben Tag, solange der sichtbare Lagerbestand reicht.</p>
            </section>

            <section className={styles.panel}>
              <h3>Mengenpreise</h3>
              <p>Kleinere Baustellenartikel werden bewusst dicht und preisnah dargestellt.</p>
            </section>
          </aside>

          <div className={styles.content}>
            <article className={styles.productCard}>
              <div className={styles.helperCard}>
                Du suchst Alternativen? Wechsle direkt in die Kategorie oder vergleiche denselben Lagerbestand darunter.
              </div>

              <div className={styles.heroRow}>
                <div className={styles.gallery}>
                  <div className={styles.galleryMain}>
                    <Image
                      className={styles.galleryImage}
                      src={product.imageUrl}
                      alt={product.imageAlt}
                      fill
                      sizes="(min-width: 780px) 280px, 100vw"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <div className={styles.thumbRow}>
                    {product.gallery.slice(0, 4).map((imageUrl) => (
                      <div key={imageUrl} className={styles.thumb}>
                        <Image
                          className={styles.thumbImage}
                          src={imageUrl}
                          alt={product.title}
                          fill
                          sizes="120px"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.buyCard}>
                  <p className={styles.overline}>
                    {product.categoryLabel} · {product.line}
                  </p>
                  <h1 className={styles.title}>{product.title}</h1>
                  <p className={styles.description}>{product.description}</p>
                  <p className={styles.metaText}>{product.spec}</p>

                  <div className={styles.priceRow}>
                    <span className={styles.price}>{formatEuro(product.priceCents)}</span>
                    <span className={styles.metaText}>inkl. 19% MwSt.</span>
                  </div>

                  <div className={styles.factList}>
                    <span className={styles.stock}>{stockLabel(product.stockCount)}</span>
                    <span>Bestand: {product.stockCount}</span>
                    <span>Same-Day-Lieferung in Bielefeld</span>
                  </div>

                  <div className={styles.deliveryRow}>Bestellung heute? Lieferfenster lokal und ohne Fake-Knappheit sichtbar.</div>

                  <div className={styles.tabRow}>
                    <span className={styles.tabActive}>Produktübersicht</span>
                    <span>Technische Daten</span>
                    <span>Lieferung</span>
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
                        imageUrl: product.imageUrl,
                        stockCount: product.stockCount
                      }}
                    />
                    <Link href="/cart" className={styles.secondaryLink}>
                      Warenkorb öffnen
                    </Link>
                  </div>
                </div>
              </div>
            </article>

            {relatedProducts.length ? (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Passend aus derselben Kategorie</h2>
                <div className={styles.relatedList}>
                  {relatedProducts.map((entry) => (
                    <Link key={entry.id} href={`/p/${entry.slug}`} className={styles.relatedCard}>
                      <div className={styles.relatedMedia}>
                        <Image
                          className={styles.relatedImage}
                          src={entry.imageUrl}
                          alt={entry.imageAlt}
                          fill
                          sizes="140px"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                      <div className={styles.relatedBody}>
                        <strong>{entry.title}</strong>
                        <p className={styles.metaText}>{entry.spec}</p>
                        <p className={styles.metaText}>{stockLabel(entry.stockCount)}</p>
                      </div>
                      <div className={styles.relatedPrice}>{formatEuro(entry.priceCents)}</div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
