"use client";

import { useCart } from "@/components/providers/cart-provider";
import { cartSubtotal, formatCurrency } from "@/lib/commerce";

export default function CheckoutPage() {
  const { cartItems, progress, updateQuantity } = useCart();
  const subtotal = cartSubtotal(cartItems);
  const shipping = cartItems.length ? 395 : 0;
  const total = subtotal - progress.discountCents + shipping;

  return (
    <div className="page-stack">
      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="overline">Checkout</p>
            <h1>PayPal-only zum Launch</h1>
            <p>Die Checkout-Struktur ist klar und mobil: Produkte, Set-Rabatt, Versand und ein einziger Launch-Payment-Pfad.</p>
          </div>
        </div>
      </section>

      <section className="checkout-layout">
        <div className="checkout-column">
          {cartItems.map((item) => (
            <article key={item.id} className="checkout-item">
              <img src={item.image} alt={item.title} />
              <div>
                <strong>{item.title}</strong>
                <span>{formatCurrency(item.priceCents)}</span>
                <p>Set-Rabatt faehig</p>
              </div>
              <div className="quantity-controls">
                <button type="button" onClick={() => updateQuantity(item.id, -1)}>-</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => updateQuantity(item.id, 1)}>+</button>
              </div>
            </article>
          ))}
        </div>
        <aside className="summary-card">
          <strong>Bestelluebersicht</strong>
          <div className="summary-line"><span>Zwischensumme</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="summary-line"><span>Set-Rabatt</span><span>{progress.discountCents ? `-${formatCurrency(progress.discountCents)}` : "-"}</span></div>
          <div className="summary-line"><span>Versand</span><span>{shipping ? formatCurrency(shipping) : "-"}</span></div>
          <div className="summary-line total"><span>Gesamt</span><span>{formatCurrency(total)}</span></div>
          <div className="payment-card">
            <strong>PayPal</strong>
            <p>{progress.unlocked ? "Rabatt beruecksichtigt" : "Live-Checkout spaeter mit PAYPAL_CLIENT_ID"}</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
