"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { PayPalCheckoutPanel } from "@/components/shop/paypal-checkout-panel";
import { CardCheckoutPanel } from "@/components/shop/card-checkout-panel";
import { AuthEntryCard } from "@/components/shop/auth-entry-card";
import { cartSubtotal, formatCurrency } from "@/lib/commerce";

export default function CheckoutPage() {
  const { cartItems, updateQuantity } = useCart();
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const subtotal = cartSubtotal(cartItems);
  const shipping = cartItems.length ? 395 : 0;
  const total = subtotal + shipping;
  const canPay = Boolean(user && cartItems.length);

  return (
    <div className="page-stack">
      <section className="checkout-steps">
        <span className="checkout-step is-active">1. Anmeldung</span>
        <span className="checkout-step">2. Adresse</span>
        <span className="checkout-step">3. Zahlung</span>
        <span className="checkout-step">4. Prüfen</span>
      </section>

      {!cartItems.length ? (
        <section className="section-block section-block--soft">
          <div className="section-header">
            <div>
              <p className="overline">Warenkorb leer</p>
              <h2>Dein Warenkorb ist leer.</h2>
            </div>
            <Link href="/kategorie/leuchtmittel" className="primary-link">Zu den Leuchtmitteln</Link>
          </div>
        </section>
      ) : null}

      {!ready ? (
        <section className="section-block section-block--soft">
          <div className="section-header">
            <div>
              <p className="overline">Konto</p>
              <h2>Anmeldung wird geprüft</h2>
            </div>
          </div>
        </section>
      ) : !user ? (
        <section className="section-block section-block--soft">
          <div className="section-header">
            <div>
              <p className="overline">Konto</p>
              <h2>Bitte melde dich vor der Bezahlung an.</h2>
            </div>
            <Link href={`/konto?next=${encodeURIComponent(pathname)}`} className="secondary-link">Anmelden</Link>
          </div>
        </section>
      ) : null}

      <section className="checkout-layout checkout-layout--redone">
        <div className="checkout-column">
          {cartItems.map((item) => (
            <article key={item.id} className="checkout-item">
              <img src={item.image} alt={item.title} />
              <div>
                <strong>{item.title}</strong>
                <span>{formatCurrency(item.priceCents)}</span>
                <p>{item.spec}</p>
              </div>
              <div className="quantity-controls">
                <button type="button" onClick={() => updateQuantity(item.id, -1)}>-</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => updateQuantity(item.id, 1)}>+</button>
              </div>
            </article>
          ))}
        </div>
        <aside className="summary-card summary-card--checkout">
          <strong>Ihre Bestellung</strong>
          <div className="summary-line"><span>Zwischensumme</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="summary-line"><span>Versand</span><span>{shipping ? formatCurrency(shipping) : "-"}</span></div>
          <div className="summary-line total"><span>Gesamt</span><span>{formatCurrency(total)}</span></div>
          {user && cartItems.length ? (
            <>
              <PayPalCheckoutPanel totalCents={total} disabled={!canPay} />
              <CardCheckoutPanel disabled={!canPay} />
            </>
          ) : cartItems.length ? (
            <AuthEntryCard compact title="Anmeldung erforderlich" text="Zum Bezahlen bitte zuerst anmelden." />
          ) : null}
        </aside>
      </section>
    </div>
  );
}
