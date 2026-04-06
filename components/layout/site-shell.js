"use client";

import { Header } from "@/components/layout/header";
import { StickyCartCta } from "@/components/layout/sticky-cart-cta";
import { useCart } from "@/components/providers/cart-provider";

export function SiteShell({ children }) {
  const { progress, cartItems } = useCart();
  const ctaHref = cartItems.length ? "/checkout" : "/sets";
  const ctaLabel = cartItems.length ? "Zur Kasse" : "Set sammeln";

  return (
    <>
      <Header />
      <main className="page-shell">{children}</main>
      <aside className="set-dock">
        <div>
          <strong>{progress.unlocked ? "20% Rabatt aktiv" : `${progress.itemsNeeded} Produkt${progress.itemsNeeded === 1 ? "" : "e"} bis zum Set`}</strong>
          <span>{cartItems.length} Positionen im Warenkorb</span>
        </div>
        <StickyCartCta href={ctaHref} label={ctaLabel} />
      </aside>
    </>
  );
}
