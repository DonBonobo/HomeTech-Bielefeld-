"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/commerce";
import { useCart } from "@/components/providers/cart-provider";

export function SetProgress({ compact = false, ctaHref = "/sets", ctaLabel = "Set-Angebote ansehen" }) {
  const { progress } = useCart();

  return (
    <section className={`set-progress ${compact ? "is-compact" : ""}`}>
      <div>
        <p className="overline">Set-Rabatt</p>
        <h2>{progress.unlocked ? "20% Set-Rabatt aktiv" : `Noch ${progress.itemsNeeded} Produkt${progress.itemsNeeded === 1 ? "" : "e"} bis zum 20% Rabatt`}</h2>
        <p>{progress.unlocked ? `Du sparst aktuell ${formatCurrency(progress.discountCents)} und kannst direkt weiter kombinieren.` : "1 qualifizierender Warenkorb reicht nicht. Ab 4 passenden Artikeln wird der Rabatt automatisch abgezogen."}</p>
      </div>
      <div className="progress-bar"><span style={{ width: `${progress.progressPercent}%` }} /></div>
      <div className="chip-row">
        <span>{progress.quantity} qualifizierende Artikel</span>
        <span>{progress.unlocked ? "Rabatt laeuft" : "Mix & Match"}</span>
      </div>
      {!progress.unlocked ? <div className="set-progress-note">20% Rabatt ab dem 4. passenden Artikel</div> : null}
      <Link href={ctaHref} className="primary-link">{ctaLabel}</Link>
    </section>
  );
}
