import Link from "next/link";
import styles from "@/components/home/homepage.module.css";
import { CategoryShortcuts } from "@/components/home/category-shortcuts";
import { ProductCard } from "@/components/home/product-card";
import { SiteHeader } from "@/components/home/site-header";
import { ValueStrip } from "@/components/home/value-strip";
import type { HomepageData, ProductCardModel } from "@/lib/catalog/types";

function ProductSection({
  title,
  body,
  products
}: {
  title: string;
  body: string;
  products: ProductCardModel[];
}) {
  return (
    <section className={styles.section} aria-labelledby={title}>
      <div className={styles.sectionHead}>
        <div>
          <h2 id={title} className={styles.sectionTitle}>
            {title}
          </h2>
          <p className={styles.sectionBody}>{body}</p>
        </div>
      </div>
      {products.length ? (
        <div className={styles.productGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          Keine Treffer gefunden. Suche nach Größe, Material oder einer Kategorie wie Dübel, Schrauben oder Sanitär.
        </div>
      )}
    </section>
  );
}

export function Homepage({ data }: { data: HomepageData }) {
  const sectionTitle = "Top-Seller";
  const sectionBody = "Häufig gekaufte Essentials aus lokalem Bestand, direkt lieferbar.";

  return (
    <main className={styles.page}>
      <div className={styles.stack}>
        <SiteHeader />

        <section className={styles.hero}>
          <div className={styles.heroHeader}>
            <div className={styles.crumbs}>
              <span>Home</span>
              <span>·</span>
              <span>Hardware Essentials</span>
              {data.activeCategory ? (
                <>
                  <span>·</span>
                  <span>{data.activeCategory}</span>
                </>
              ) : null}
            </div>
            <div>
              <h1 className={styles.title}>Finden, prüfen, bestellen.</h1>
              <p className={styles.lead}>
                Handliche Heimwerkerartikel aus lokalem Bielefelder Lagerbestand. Preis, Bestand und Same-Day-Lieferung
                sofort sichtbar.
              </p>
            </div>

            <form className={styles.searchForm} action="/search" method="get">
              <div className={styles.searchControls}>
                <input
                  className={styles.searchInput}
                  type="search"
                  name="q"
                  defaultValue={data.activeQuery}
                  placeholder="Suche nach Schrauben, Dübeln, PTFE-Band, Klemmenleisten ..."
                  aria-label="Produkte durchsuchen"
                />
                <div className={styles.searchActions}>
                  <button className={styles.searchButton} type="submit">
                    Suchen
                  </button>
                  {data.hasSearch ? (
                    <Link className={styles.clearButton} href="/">
                      Zurücksetzen
                    </Link>
                  ) : null}
                </div>
              </div>
            </form>

            <div className={styles.summary}>
              <span>
                <strong>6 Kategorien</strong> für den Sofortzugriff
              </span>
              <span>
                <strong>Klare Preise</strong> inkl. MwSt.
              </span>
              <span>
                <strong>Same-Day</strong> in Bielefeld
              </span>
              <span>
                <strong>Login vor Kauf</strong>, bewusst schlank gehalten
              </span>
            </div>
          </div>
        </section>

        <CategoryShortcuts categories={data.categories} />
        <ValueStrip />
        <ProductSection title={sectionTitle} body={sectionBody} products={data.featuredProducts} />
      </div>
    </main>
  );
}
