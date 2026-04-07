import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/home/site-header";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import styles from "@/components/listing/listing-page.module.css";
import { formatEuro } from "@/lib/format";
import type { ListingData } from "@/lib/catalog/types";

function stockLabel(stockCount: number) {
  if (stockCount >= 20) return "Sofort lagernd";
  if (stockCount >= 10) return "Lokal auf Lager";
  return "Kleiner Bestand, heute verfügbar";
}

function sortLabel(mode: ListingData["mode"], sort: ListingData["sort"]) {
  if (sort === "price-asc") return "Preis aufsteigend";
  if (sort === "price-desc") return "Preis absteigend";
  return mode === "search" ? "Relevanz" : "Empfohlen";
}

export function ListingPage({ data }: { data: ListingData }) {
  return (
    <main className={styles.page}>
      <div className={styles.stack}>
        <SiteHeader />

        <section className={styles.hero}>
          <div className={styles.breadcrumbs}>
            {data.breadcrumbs.map((crumb, index) => (
              <span key={crumb.href}>
                {index > 0 ? "· " : ""}
                <Link href={crumb.href}>{crumb.label}</Link>
              </span>
            ))}
          </div>
          <div>
            <h1 className={styles.heroTitle}>{data.heading}</h1>
            <p className={styles.heroBody}>{data.subheading}</p>
          </div>

          <form className={styles.searchForm} action="/search" method="get">
            <div className={styles.searchRow}>
              <input
                className={styles.searchInput}
                type="search"
                name="q"
                defaultValue={data.activeQuery}
                placeholder="Suche nach fischer, PTFE, Schrauben, Klemmenleisten ..."
                aria-label="Produkte durchsuchen"
              />
              <select className={styles.sortSelect} name="sort" defaultValue={data.sort} aria-label="Sortierung">
                <option value="default">{sortLabel(data.mode, data.sort)}</option>
                <option value="price-asc">Preis aufsteigend</option>
                <option value="price-desc">Preis absteigend</option>
              </select>
              <button className={styles.searchButton} type="submit">
                Suchen
              </button>
            </div>
          </form>

          <div className={styles.metaStrip}>
            <span>{data.total} sichtbare Produkte</span>
            <span>inkl. 19% MwSt.</span>
            <span>Same-Day in Bielefeld</span>
            <span>PayPal Checkout oder Bestellanfrage</span>
          </div>
        </section>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <section className={styles.panel}>
              <h2>Kategorien</h2>
              <p>Reduzierte, ehrliche Auswahl mit echten Trefferzahlen aus dem aktuellen Datenbestand.</p>
              <div className={styles.facetList}>
                {data.categoryLinks.map((item) => (
                  <Link
                    key={item.slug}
                    href={item.href}
                    className={`${styles.facetLink} ${item.active ? styles.facetActive : ""}`.trim()}
                  >
                    <span>{item.label}</span>
                    <span className={styles.count}>{item.count}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <h3>Sortierung</h3>
              <p>
                {data.mode === "search"
                  ? "Standard ist Relevanz, alternativ Preis auf- oder absteigend."
                  : "Standard ist empfohlen, alternativ Preis auf- oder absteigend."}
              </p>
            </section>

            <section className={styles.panel}>
              <h3>Lieferung in Bielefeld</h3>
              <p>Kostenlos am selben Tag aus lokalem Bestand, solange Artikel sichtbar und vorrätig sind.</p>
            </section>
          </aside>

          <section className={styles.results} aria-label="Produktliste">
            {data.products.length ? (
              data.products.map((product) => (
                <article key={product.id} className={styles.resultCard}>
                  <Link href={`/p/${product.slug}`} className={styles.resultMedia}>
                    <Image
                      src={product.imageUrl}
                      alt={product.imageAlt}
                      fill
                      sizes="(min-width: 780px) 220px, 100vw"
                      style={{ objectFit: "contain", padding: "14px" }}
                    />
                  </Link>

                  <div className={styles.resultBody}>
                    <div>
                      <div className={styles.eyebrow}>
                        {product.categoryLabel} · {product.line}
                      </div>
                      <h2 className={styles.resultTitle}>
                        <Link href={`/p/${product.slug}`}>{product.title}</Link>
                      </h2>
                      <p className={styles.resultText}>{product.spec}</p>
                      <p className={styles.resultText}>{product.short}</p>
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

                    <div className={styles.ctaRow}>
                      <AddToCartButton
                        className={styles.ctaButton}
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
                      <span className={styles.ctaNote}>Bezahlen mit PayPal oder als Anfrage abschließen, ohne falschen Paid-Status.</span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className={styles.emptyState}>{data.emptyState}</div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
