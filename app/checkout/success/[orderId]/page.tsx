import { notFound } from "next/navigation";
import { CheckoutStatus } from "@/components/checkout/checkout-status";
import styles from "@/components/checkout/checkout-status.module.css";
import { getStoredOrder, parseOrderPayload } from "@/lib/checkout";
import { formatEuro } from "@/lib/format";

type SuccessPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function CheckoutSuccessPage({ params }: SuccessPageProps) {
  const { orderId } = await params;
  const order = await getStoredOrder(orderId).catch(() => null);

  if (!order) {
    notFound();
  }

  const payload = parseOrderPayload(order.paypal_order_id);
  if (!payload || order.status !== "paid" || payload.mode !== "paypal_checkout") {
    return (
      <CheckoutStatus
        tone="warning"
        badge="!"
        title="Noch nicht bezahlt"
        body="Für diese Referenz liegt aktuell keine bestätigte PayPal Zahlung vor."
        reference={orderId}
        actions={[
          { href: "/checkout", label: "Zurück zum Checkout", primary: true },
          { href: "/", label: "Zur Startseite" }
        ]}
      />
    );
  }

  return (
    <CheckoutStatus
      tone="success"
      badge="OK"
      title="Zahlung bestätigt"
      body="Dein Einkauf wurde erfolgreich per PayPal bezahlt. Die Bestellung ist jetzt sauber als paid markiert."
      reference={orderId}
      actions={[
        { href: "/", label: "Weiter einkaufen", primary: true },
        { href: "/search?q=fischer", label: "Zur Suche" }
      ]}
    >
      <div className={styles.summaryGrid}>
        <div className={styles.summaryRow}>
          <span>Status</span>
          <strong>{order.status}</strong>
        </div>
        <div className={styles.summaryRow}>
          <span>Gesamt</span>
          <strong>{formatEuro(order.total_cents)}</strong>
        </div>
        <div className={styles.summaryRow}>
          <span>PayPal Order ID</span>
          <strong>{payload.payment?.paypalOrderId ?? "nicht gespeichert"}</strong>
        </div>
        <div className={styles.summaryRow}>
          <span>Capture ID</span>
          <strong>{payload.payment?.captureId ?? "nicht gespeichert"}</strong>
        </div>
        <div className={styles.summaryRow}>
          <span>Bezahlt am</span>
          <strong>{payload.payment?.paidAt ?? order.created_at}</strong>
        </div>
      </div>

      <div>
        <strong>Kundendaten</strong>
        <p className={styles.muted} style={{ marginBottom: 0 }}>
          {payload.customer.fullName}
          <br />
          {payload.customer.email}
          <br />
          {payload.customer.phone}
          <br />
          {payload.customer.street}, {payload.customer.postalCode} {payload.customer.city}
        </p>
      </div>

      <div>
        <strong>Artikel</strong>
        <div className={styles.lineItems}>
          {payload.items.map((item) => (
            <div key={item.productId} className={styles.lineItem}>
              <div>
                <strong>{item.title}</strong>
                <div className={styles.muted}>{item.spec}</div>
                <div className={styles.muted}>
                  {item.quantity} × {formatEuro(item.unitPriceCents)}
                </div>
              </div>
              <strong>{formatEuro(item.unitPriceCents * item.quantity)}</strong>
            </div>
          ))}
        </div>
      </div>
    </CheckoutStatus>
  );
}
