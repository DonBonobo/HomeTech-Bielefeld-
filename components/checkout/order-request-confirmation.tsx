import Link from "next/link";
import { SiteHeader } from "@/components/home/site-header";
import { formatEuro } from "@/lib/format";
import type { OrderPayload } from "@/lib/checkout-types";
import styles from "@/components/checkout/order-request-confirmation.module.css";

type StoredOrderSummary = {
  id: string;
  created_at: string;
  total_cents: number;
  status: string;
  paypal_order_id: string | null;
} | null;

export function OrderRequestConfirmation({
  requestId,
  order,
  payload
}: {
  requestId: string;
  order: StoredOrderSummary;
  payload: OrderPayload | null;
}) {
  const firstItem = payload?.items?.[0] ?? null;

  return (
    <main className={styles.page}>
      <SiteHeader />
      <section className={styles.card}>
        <div className={styles.badge}>✓</div>
        <div className={styles.head}>
          <h1 className={styles.title}>Bestellanfrage erhalten</h1>
          <p className={styles.copy}>
            Keine Zahlung wurde ausgelöst. Die Anfrage ist gespeichert und bleibt bis zur manuellen Bestätigung
            ausdrücklich unbezahlt.
          </p>
          <p className={styles.statusNote}>Zahlungsstatus: nicht bezahlt</p>
        </div>

        <div className={styles.highlightRow}>
          <div className={styles.highlightCard}>
            <strong>Referenz</strong>
            <span>{requestId}</span>
          </div>
          <div className={styles.highlightCard}>
            <strong>Status</strong>
            <span>{order?.status ?? "request_pending"}</span>
          </div>
          <div className={styles.highlightCard}>
            <strong>Gesamt</strong>
            <span>{formatEuro(order?.total_cents ?? 0)}</span>
          </div>
        </div>

        <div className={styles.summaryGrid}>
          <section className={styles.summaryCard}>
            <h2>Bestellübersicht</h2>
            {firstItem ? (
              <>
                <div className={styles.summaryLine}>
                  <span>{firstItem.title}</span>
                  <strong>{formatEuro(firstItem.unitPriceCents * firstItem.quantity)}</strong>
                </div>
                <div className={styles.metaLine}>
                  <span>
                    {firstItem.quantity} × {formatEuro(firstItem.unitPriceCents)}
                  </span>
                  <span>{firstItem.spec}</span>
                </div>
              </>
            ) : null}
            <div className={styles.summaryTotals}>
              <div className={styles.summaryLine}>
                <span>Zwischensumme</span>
                <span>{formatEuro(order?.total_cents ?? 0)}</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Lieferung</span>
                <span>Kostenlos in Bielefeld</span>
              </div>
              <div className={styles.summaryLine}>
                <strong>Gesamt</strong>
                <strong>{formatEuro(order?.total_cents ?? 0)}</strong>
              </div>
            </div>
          </section>

          <section className={styles.summaryCard}>
            <h2>Lieferadresse</h2>
            {payload?.customer ? (
              <div className={styles.address}>
                <span>{payload.customer.fullName}</span>
                <span>{payload.customer.street}</span>
                <span>
                  {payload.customer.postalCode} {payload.customer.city}
                </span>
                <span>{payload.customer.email}</span>
              </div>
            ) : (
              <p className={styles.copy}>Die Adressdaten sind gespeichert und werden bei der Bestätigung geprüft.</p>
            )}
          </section>
        </div>

        <div className={styles.infoList}>
          <span>✓ Lagerbestand und Lieferzeit werden manuell bestätigt.</span>
          <span>✓ Same-Day in Bielefeld bleibt sichtbar, wird aber nicht falsch garantiert.</span>
          <span>✓ Bezahlt wird hier nicht vorgetäuscht.</span>
        </div>

        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>
            Weiter einkaufen
          </Link>
          <Link href="/search?q=fischer" className={styles.secondary}>
            Zur Suche
          </Link>
        </div>
      </section>
    </main>
  );
}
