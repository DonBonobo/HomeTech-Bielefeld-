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

      <section className={styles.shell}>
        <div className={styles.panel}>
          <h1 className={styles.heading}>Warenkorb</h1>
          <p className={styles.muted}>Artikel bleiben lokal im Browser erhalten. Bezahlt gilt erst nach bestätigter Freigabe.</p>

          {items.length ? (
            <>
              <div className={styles.shippingBar}>Schnelle Bielefeld-Lieferung aus lokalem Lagerbestand, solange Artikel sichtbar und vorrätig sind.</div>

              <div className={styles.itemList}>
                {items.map((item) => (
                  <article key={item.productId} className={styles.item}>
                    <div className={styles.media}>
                      <Image src={item.imageUrl} alt={item.title} fill sizes="92px" style={{ objectFit: "contain", padding: "10px" }} />
                    </div>
                    <div className={styles.itemBody}>
                      <div>
                        <h2 className={styles.title}>
                          <Link href={`/p/${item.slug}`}>{item.title}</Link>
                        </h2>
                        <p className={styles.meta}>{item.spec}</p>
                        <p className={styles.meta}>In stock • Same-Day delivery in Bielefeld</p>
                      </div>

                      <div className={styles.itemAside}>
                        <strong className={styles.lineTotal}>{formatEuro(item.priceCents * item.quantity)}</strong>
                        <span className={styles.meta}>
                          {item.quantity} × {formatEuro(item.priceCents)}
                        </span>
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
                          <button type="button" onClick={() => removeItem(item.productId)} className={styles.removeButton}>
                            Entfernen
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className={styles.summary}>
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
                <div className={styles.benefits}>
                  <span>✓ Kostenlose Same-Day-Lieferung in Bielefeld</span>
                  <span>✓ Ehrliche Bestellanfrage ohne Fake-Paid-Status</span>
                  <span>✓ PayPal erst nach bestätigter Freigabe</span>
                </div>
                <Link href="/checkout" className={styles.primary}>
                  Zum Checkout
                </Link>
                <Link href="/" className={styles.secondary}>
                  Weiter einkaufen
                </Link>
              </div>
            </>
          ) : (
            <div>
              <p className={styles.muted}>Noch keine Artikel im Warenkorb.</p>
              <Link href="/" className={styles.secondary}>
                Zur Startseite
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
