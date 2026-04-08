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
  const sectionBody = "Kompakte Lagerartikel mit klaren Preisen, sichtbarem Bestand und schneller Lieferung in Bielefeld.";

  return (
    <main className={styles.page}>
      <div className={styles.stack}>
        <SiteHeader />

        <section className={styles.searchShell}>
          <div className={styles.searchLead}>Lagerbestand lokal durchsuchen</div>
          <form className={styles.searchForm} action="/search" method="get">
            <div className={styles.searchControls}>
              <input
                className={styles.searchInput}
                type="search"
                name="q"
                defaultValue={data.activeQuery}
                placeholder="Search for screws, anchors, adhesives, etc..."
                aria-label="Produkte durchsuchen"
              />
              <div className={styles.searchActions}>
                <button className={styles.searchButton} type="submit">
                  Search
                </button>
                {data.hasSearch ? (
                  <Link className={styles.clearButton} href="/">
                    Zurücksetzen
                  </Link>
                ) : null}
              </div>
            </div>
          </form>
        </section>

        <div className={styles.infoRail}>
          <span>✓ Vollsortiment für kompakte Baustellenartikel</span>
          <span>✓ Lokaler Bestand mit Same-Day-Lieferung in Bielefeld</span>
          <Link href="/search" className={styles.railLink}>
            Alle Produkte ansehen
          </Link>
        </div>

        <section className={styles.introSection}>
          <div>
            <h1 className={styles.title}>Bielefelder Heimwerkerbedarf zu klaren Preisen</h1>
            <p className={styles.lead}>
              Handliche Lagerartikel mit sichtbarem Bestand, klaren Preisen und lokalem Versand. Der Fokus liegt auf
              klarer Auswahl statt Deko.
            </p>
          </div>
          <div className={styles.introList}>
            <span>✓ Kostenlose Same-Day-Lieferung in Bielefeld</span>
            <span>✓ Große Rabatte auf sinnvolle Mehrmengen</span>
          </div>
        </section>

        <CategoryShortcuts categories={data.categories} />
        <ProductSection title={sectionTitle} body={sectionBody} products={data.featuredProducts} />
        <div className={styles.browseRow}>
          <Link href="/search" className={styles.browseLink}>
            Alle Produkte durchsuchen
          </Link>
        </div>
        <ValueStrip />
      </div>
    </main>
  );
}
