"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/commerce";
import { useCart } from "@/components/providers/cart-provider";

export function SetProgress({ compact = false, ctaHref = "/sets", ctaLabel = "Set-Angebote ansehen" }) {
  const { progress } = useCart();

  return (
    <section className={`set-progress ${compact ? "is-compact" : ""}`}>
      <div>
        <p className="overline">Set-Vorteil</p>
        <h2>{progress.unlocked ? "20% Set-Rabatt aktiv" : `Noch ${progress.itemsNeeded} Produkt${progress.itemsNeeded === 1 ? "" : "e"} bis zum Set-Rabatt`}</h2>
        <p>{progress.unlocked ? `Du sparst aktuell ${formatCurrency(progress.discountCents)}.` : "Fuelle deinen Warenkorb mit 4 qualifizierenden Produkten und der Rabatt wird automatisch abgezogen."}</p>
      </div>
      <div className="progress-bar"><span style={{ width: `${progress.progressPercent}%` }} /></div>
      <div className="chip-row">
        <span>{progress.quantity} qualifizierende Artikel</span>
        <span>{progress.unlocked ? "Rabatt laeuft" : "Mix & Match"}</span>
      </div>
      <Link href={ctaHref} className="primary-link">{ctaLabel}</Link>
    </section>
  );
}
