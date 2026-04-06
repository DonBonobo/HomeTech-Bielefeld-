"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { useCart } from "@/components/providers/cart-provider";

export function SiteShell({ children }) {
  const { progress, cartItems } = useCart();

  return (
    <>
      <Header />
      <main className="page-shell">{children}</main>
      <aside className="set-dock">
        <div>
          <strong>{progress.unlocked ? "20% Rabatt aktiv" : `${progress.itemsNeeded} Produkt${progress.itemsNeeded === 1 ? "" : "e"} bis zum Set`}</strong>
          <span>{cartItems.length} Positionen im Warenkorb</span>
        </div>
        <Link href={cartItems.length ? "/checkout" : "/sets"} className="primary-link">
          {cartItems.length ? "Zur Kasse" : "Set sammeln"}
        </Link>
      </aside>
    </>
  );
}
