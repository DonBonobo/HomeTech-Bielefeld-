"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/home/site-header";
import { useCart } from "@/components/providers/cart-provider";
import { formatEuro } from "@/lib/format";
import styles from "@/components/cart/cart-page.module.css";

export function CartPage() {
  const { items, subtotalCents, updateQuantity, removeItem } = useCart();

  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.layout}>
        <div className={styles.panel}>
          <h1 style={{ marginTop: 0 }}>Warenkorb</h1>
          <p className={styles.muted}>Artikel bleiben lokal im Browser erhalten. Bezahlt wird erst nach bestätigter PayPal Freigabe.</p>

          {items.length ? (
            <div className={styles.itemList}>
              {items.map((item) => (
                <article key={item.productId} className={styles.item}>
                  <div className={styles.media}>
                    <Image src={item.imageUrl} alt={item.title} fill sizes="92px" style={{ objectFit: "contain", padding: "10px" }} />
                  </div>
                  <div>
                    <h2 className={styles.title}>
                      <Link href={`/p/${item.slug}`}>{item.title}</Link>
                    </h2>
                    <p className={styles.muted} style={{ margin: "4px 0" }}>
                      {item.spec}
                    </p>
                    <p style={{ margin: 0 }}>{formatEuro(item.priceCents)}</p>
                    <div className={styles.row}>
                      <div className={styles.qty}>
                        <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          disabled={item.quantity >= item.stockCount}
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button type="button" onClick={() => removeItem(item.productId)} style={{ border: 0, background: "transparent", color: "var(--muted)" }}>
                        Entfernen
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div>
              <p className={styles.muted}>Noch keine Artikel im Warenkorb.</p>
              <Link href="/" className={styles.secondary}>
                Zur Startseite
              </Link>
            </div>
          )}
        </div>

        <aside className={styles.summary}>
          <h2 style={{ marginTop: 0 }}>Bestellübersicht</h2>
          <div className={styles.summaryLines}>
            <div className={styles.summaryLine}>
              <span>Zwischensumme</span>
              <span>{formatEuro(subtotalCents)}</span>
            </div>
            <div className={styles.summaryLine}>
              <span>Lieferung</span>
              <span>Kostenlos in Bielefeld</span>
            </div>
            <div className={styles.summaryLine}>
              <strong>Gesamt</strong>
              <strong>{formatEuro(subtotalCents)}</strong>
            </div>
          </div>
          <p className={styles.muted}>Weiter im Checkout mit PayPal oder als manuelle Bestellanfrage. Bezahlt gilt erst nach Capture-Erfolg.</p>
          <Link href="/checkout" className={styles.primary}>
            Zum Checkout
          </Link>
        </aside>
      </section>
    </main>
  );
}
