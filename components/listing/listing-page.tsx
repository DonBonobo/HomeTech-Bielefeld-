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
                {index > 0 ? "› " : ""}
                <Link href={crumb.href}>{crumb.label}</Link>
              </span>
            ))}
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

          <div>
            <h1 className={styles.heroTitle}>{data.heading}</h1>
            <p className={styles.heroBody}>{data.subheading}</p>
          </div>

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
              <h2>Filter</h2>
              <p>Kategorien mit echten Trefferzahlen aus dem aktuellen Lagerbestand.</p>
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
            {data.mode === "search" ? (
              <div className={styles.helperCard}>
                Nicht der richtige Treffer? Wechsle in die Kategorie oder sortiere nach Preis, um denselben Lagerbestand
                kompakter zu durchsuchen.
              </div>
            ) : null}
            {data.products.length ? (
              <>
                {data.products.map((product) => (
                  <article key={product.id} className={styles.resultCard}>
                    <Link href={`/p/${product.slug}`} className={styles.resultMedia}>
                      <Image
                        className={styles.resultImage}
                        src={product.imageUrl}
                        alt={product.imageAlt}
                        fill
                        sizes="(min-width: 780px) 160px, 100vw"
                        style={{ objectFit: "contain" }}
                      />
                    </Link>

                    <div className={styles.resultBody}>
                      <div className={styles.resultMain}>
                        <div className={styles.eyebrow}>
                          {product.categoryLabel} · {product.line}
                        </div>
                        <h2 className={styles.resultTitle}>
                          <Link href={`/p/${product.slug}`}>{product.title}</Link>
                        </h2>
                        <p className={styles.resultText}>{product.short}</p>
                        <p className={styles.resultMeta}>{product.spec}</p>

                        <div className={styles.facts}>
                          <span className={styles.stock}>{stockLabel(product.stockCount)}</span>
                          <span>Bestand: {product.stockCount}</span>
                          <span>Same-Day-Lieferung in Bielefeld</span>
                        </div>
                      </div>

                      <div className={styles.resultSide}>
                        <div className={styles.priceRow}>
                          <span className={styles.price}>{formatEuro(product.priceCents)}</span>
                          <span className={styles.vat}>inkl. 19% MwSt.</span>
                        </div>
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
                        <span className={styles.ctaNote}>Zahlung erst nach bestätigter Freigabe oder Anfrage.</span>
                      </div>
                    </div>
                  </article>
                ))}

                <div className={styles.resultsFooter}>
                  <span>✓ Vollsortiment für Lagerartikel ohne Umwege</span>
                  <span>✓ Same-Day-Lieferung in Bielefeld</span>
                  <span>✓ Preise und Checkout bleiben wahrheitsgemäß</span>
                </div>

                {data.extraProducts.length ? (
                  <section className={styles.extraSection}>
                    <h3 className={styles.extraTitle}>Weitere Lagerartikel</h3>
                    <div className={styles.extraGrid}>
                      {data.extraProducts.map((product) => (
                        <Link key={product.id} href={`/p/${product.slug}`} className={styles.extraCard}>
                          <div className={styles.extraMedia}>
                            <Image
                              className={styles.resultImage}
                              src={product.imageUrl}
                              alt={product.imageAlt}
                              fill
                              sizes="160px"
                              style={{ objectFit: "contain" }}
                            />
                          </div>
                          <div>
                            <strong>{product.title}</strong>
                            <p className={styles.resultMeta}>{product.spec}</p>
                            <p className={styles.resultMeta}>{formatEuro(product.priceCents)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null}
              </>
            ) : (
              <div className={styles.emptyState}>{data.emptyState}</div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
