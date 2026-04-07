import Link from "next/link";
import { SiteHeader } from "@/components/home/site-header";
import styles from "@/components/checkout/order-request-confirmation.module.css";

export function OrderRequestConfirmation({ requestId }: { requestId: string }) {
  return (
    <main className={styles.page}>
      <SiteHeader />
      <section className={styles.card}>
        <div className={styles.badge}>OK</div>
        <div>
          <h1 style={{ margin: "0 0 8px" }}>Bestellanfrage erhalten</h1>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Keine Zahlung wurde ausgelöst. Die Anfrage wurde gespeichert und kann jetzt manuell bestätigt werden.
          </p>
        </div>
        <div>
          <strong>Referenz</strong>
          <div>{requestId}</div>
        </div>
        <div style={{ display: "grid", gap: "8px", color: "var(--muted)" }}>
          <span>Wir können auf Basis dieser Anfrage Lagerbestand, Lieferzeit und den nächsten Schritt bestätigen.</span>
          <span>Same-Day-Lieferung in Bielefeld bleibt sichtbar, wird aber nicht falsch garantiert, falls Bestand wechselt.</span>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/" style={{ padding: "12px 16px", borderRadius: "14px", background: "var(--accent)", color: "#fff", fontWeight: 600 }}>
            Weiter einkaufen
          </Link>
          <Link href="/search?q=fischer" style={{ padding: "12px 16px", borderRadius: "14px", background: "var(--surface-muted)", border: "1px solid var(--line)" }}>
            Zur Suche
          </Link>
        </div>
      </section>
    </main>
  );
}
