"use client";

import { bundles } from "@/lib/catalog";
import { formatCurrency } from "@/lib/commerce";
import { useCart } from "@/components/providers/cart-provider";
import { SetProgress } from "@/components/shop/set-progress";

export default function SetsPage() {
  const { addBundle } = useCart();

  return (
    <div className="page-stack">
      <section className="hero-card sets-hero-card">
        <div className="hero-copy">
          <p className="overline">Sets & Sparoptionen</p>
          <h1>Smarte Sets und Sparoptionen</h1>
          <p>Der schnellste Weg fuer die Conversion: gute Produkte kombinieren, Fortschritt sehen, Rabatt automatisch freischalten.</p>
        </div>
        <div className="hero-reference">
          <img src="/assets/references/wf5.png" alt="Sets Referenz" />
        </div>
      </section>

      <SetProgress />

      <section className="promo-grid">
        <article className="promo-card">
          <strong>20% Rabatt auf Sets</strong>
          <p>Kaufe mindestens 4 qualifizierende Produkte. Der Rabatt wird automatisch in Warenkorb und Checkout angezeigt.</p>
        </article>
        <article className="promo-card">
          <strong>Bestpreis-Garantie</strong>
          <p>Wenn du in Deutschland einen guenstigeren Preis findest, versuchen wir ihn fuer dich um 10% zu unterbieten.</p>
        </article>
      </section>

      <section className="bundle-grid">
        {bundles.map((bundle) => (
          <article key={bundle.id} className="bundle-card">
            <img src={bundle.image} alt={bundle.title} />
            <h3>{bundle.title}</h3>
            <p>{bundle.description}</p>
            <div className="chip-row">
              <span>-20%</span>
              <span>Kostenloser Versand</span>
            </div>
            <div className="bundle-price">
              <span>{formatCurrency(15995)}</span>
              <strong>{formatCurrency(12796)}</strong>
            </div>
            <button type="button" className="primary-action" onClick={() => addBundle(bundle.items)}>
              In den Warenkorb
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
