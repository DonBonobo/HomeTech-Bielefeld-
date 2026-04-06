"use client";

import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";
import { PayPalCheckoutPanel } from "@/components/shop/paypal-checkout-panel";
import { cartSubtotal, formatCurrency } from "@/lib/commerce";

export default function CheckoutPage() {
  const { cartItems, updateQuantity } = useCart();
  const subtotal = cartSubtotal(cartItems);
  const shipping = cartItems.length ? 395 : 0;
  const total = subtotal + shipping;

  return (
    <div className="page-stack">
      <section className="section-block checkout-hero">
        <div className="section-header">
          <div>
            <p className="overline">Checkout</p>
            <h1>PayPal-only zum Launch</h1>
            <p>Wenige Produkte, nachvollziehbarer Versand und ein ruhiger letzter Schritt bis zur Bezahlung.</p>
          </div>
        </div>
      </section>

      {!cartItems.length ? (
        <section className="section-block section-block--soft">
          <div className="section-header">
            <div>
              <p className="overline">Warenkorb leer</p>
              <h2>Lege zuerst ein Launch-Produkt in den Warenkorb.</h2>
              <p>Starte mit den aktuellen Hue-Leuchtmitteln und gehe danach direkt weiter zu PayPal.</p>
            </div>
            <Link href="/kategorie/leuchtmittel" className="primary-link">Zu den Leuchtmitteln</Link>
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
          <strong>Bestelluebersicht</strong>
          <div className="summary-line"><span>Zwischensumme</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="summary-line"><span>Versand</span><span>{shipping ? formatCurrency(shipping) : "-"}</span></div>
          <div className="summary-line total"><span>Gesamt</span><span>{formatCurrency(total)}</span></div>
          <PayPalCheckoutPanel totalCents={total} disabled={!cartItems.length} />
        </aside>
      </section>
    </div>
  );
}
