"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PayPalCheckoutPanel } from "@/components/checkout/paypal-checkout-panel";
import { SiteHeader } from "@/components/home/site-header";
import { useCart } from "@/components/providers/cart-provider";
import type { CheckoutCustomer, PayPalClientConfig } from "@/lib/checkout-types";
import { formatEuro } from "@/lib/format";
import styles from "@/components/checkout/checkout-page.module.css";

const initialState: CheckoutCustomer = {
  fullName: "",
  email: "",
  phone: "",
  street: "",
  postalCode: "",
  city: "Bielefeld",
  notes: ""
};

export function CheckoutPage({ paypalConfig }: { paypalConfig: PayPalClientConfig }) {
  const router = useRouter();
  const { items, subtotalCents, clear } = useCart();
  const [form, setForm] = useState<CheckoutCustomer>(initialState);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const formIsComplete = [
    form.fullName,
    form.email,
    form.phone,
    form.street,
    form.postalCode,
    form.city
  ].every((field) => field.trim().length > 0);

  async function submit() {
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/order-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: form,
        items
      })
    });

    const payload = (await response.json()) as { ok?: boolean; orderId?: string; error?: string };

    if (!response.ok || !payload.ok || !payload.orderId) {
      setError(payload.error ?? "Die Bestellanfrage konnte gerade nicht gespeichert werden.");
      setSubmitting(false);
      return;
    }

    clear();
    router.push(`/order-request/${payload.orderId}`);
  }

  async function handlePaid(orderId: string) {
    clear();
    router.push(`/checkout/success/${orderId}`);
  }

  async function handleCancelled(orderId?: string) {
    const target = orderId ? `/checkout/cancel?orderId=${encodeURIComponent(orderId)}` : "/checkout/cancel";
    router.push(target);
  }

  async function handleFailed(orderId?: string) {
    const target = orderId ? `/checkout/failure?orderId=${encodeURIComponent(orderId)}` : "/checkout/failure";
    router.push(target);
  }

  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.layout}>
        <div className={styles.panel}>
          <h1 style={{ marginTop: 0 }}>Checkout & Zahlung</h1>
          <p className={styles.notice}>
            PayPal ist der bevorzugte Abschluss. Ohne erfolgreiche PayPal Bestätigung oder manuelle
            Bestellanfrage wird nichts als bezahlt markiert.
          </p>

          {items.length ? (
            <>
              <div className={styles.grid} style={{ marginTop: "16px" }}>
                <label className={styles.field}>
                  <span>Name</span>
                  <input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
                </label>
                <label className={styles.field}>
                  <span>E-Mail</span>
                  <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
                </label>
                <label className={styles.field}>
                  <span>Telefon</span>
                  <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
                </label>
                <label className={styles.field}>
                  <span>Straße & Hausnummer</span>
                  <input value={form.street} onChange={(event) => setForm((current) => ({ ...current, street: event.target.value }))} />
                </label>
                <label className={styles.field}>
                  <span>PLZ</span>
                  <input value={form.postalCode} onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value }))} />
                </label>
                <label className={styles.field}>
                  <span>Ort</span>
                  <input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
                </label>
                <label className={`${styles.field} ${styles.wide}`}>
                  <span>Hinweise zur Lieferung</span>
                  <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
                </label>
              </div>

              <div className={styles.infoCard}>
                <strong>So läuft der Kauf</strong>
                <div className={styles.infoList}>
                  <span>1. Du prüfst Lieferadresse und Warenkorb.</span>
                  <span>2. PayPal berechnet den Betrag serverseitig aus den echten Produktdaten.</span>
                  <span>3. Erst nach bestätigtem Capture wird die Bestellung als bezahlt geführt.</span>
                </div>
              </div>

              {error ? <p className={styles.error}>{error}</p> : null}

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={submitting || !formIsComplete}
                  onClick={submit}
                >
                  {submitting ? "Bestellanfrage wird gespeichert ..." : "Ohne PayPal als Bestellanfrage senden"}
                </button>
                <Link href="/cart" className={styles.secondary}>
                  Zurück zum Warenkorb
                </Link>
              </div>
            </>
          ) : (
            <div className={styles.actions}>
              <p>Dein Warenkorb ist leer.</p>
              <Link href="/" className={styles.secondary}>
                Zur Startseite
              </Link>
            </div>
          )}
        </div>

        <aside className={styles.summary}>
          <h2 style={{ marginTop: 0 }}>Zusammenfassung</h2>
          <div className={styles.itemList}>
            {items.map((item) => (
              <div key={item.productId} className={styles.item}>
                <div>
                  <strong>{item.title}</strong>
                  <div>{item.spec}</div>
                  <div>{item.quantity} × {formatEuro(item.priceCents)}</div>
                </div>
                <strong>{formatEuro(item.priceCents * item.quantity)}</strong>
              </div>
            ))}
          </div>
            <div style={{ display: "grid", gap: "10px", marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Zwischensumme</span>
              <span>{formatEuro(subtotalCents)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Lieferung Bielefeld</span>
              <span>Kostenlos</span>
            </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Gesamt</strong>
                <strong>{formatEuro(subtotalCents)}</strong>
              </div>
            </div>

            <PayPalCheckoutPanel
              config={paypalConfig}
              customer={form}
              items={items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity
              }))}
              totalCents={subtotalCents}
              disabled={!items.length || !formIsComplete}
              onPaid={handlePaid}
              onCancelled={handleCancelled}
              onFailed={handleFailed}
            />
            <p className={styles.supportCopy}>
              Wenn PayPal gerade nicht verfügbar ist, kannst du dieselben Artikeldaten als manuelle
              Bestellanfrage speichern.
            </p>
        </aside>
      </section>
    </main>
  );
}
