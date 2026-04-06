"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { categories } from "@/lib/catalog";
import { useCart } from "@/components/providers/cart-provider";

export function Header() {
  const pathname = usePathname();
  const { cartItems, progress } = useCart();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/", label: "Startseite" },
    { href: "/kategorie/leuchtmittel", label: "Leuchtmittel" },
    { href: "/kategorie/white-ambiance", label: "White Ambiance" },
    { href: "/sets", label: "Sets" },
  ];

  return (
    <header className="site-header">
      <div className="topline">
        <span>Smarter Homes? Das gibt&apos;s doch nicht!</span>
        <span>PayPal zum Launch · Versand in ganz Europa</span>
      </div>
      <div className="header-row">
        <Link href="/" className="brand-link" onClick={() => setOpen(false)}>
          <span className="brand-mark-shell">
            <span className="brand-mark-circle">HT</span>
          </span>
          <span className="brand-wordmark">
            <Image
              src="/assets/brand/logo-home-tech-horizontal-dark.png"
              alt="HomeTech Bielefeld"
              width={520}
              height={146}
              className="brand-wordmark-image"
            />
            <span className="brand-mobile-copy">
              <strong>HomeTech Bielefeld</strong>
              <small>Smarte Technik fuer dein Zuhause.</small>
            </span>
          </span>
        </Link>
        <nav className="desktop-nav">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? "is-active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/" className="search-chip">
            Suchen
          </Link>
          <Link href="/checkout" className="cart-button">
            <span>Warenkorb</span>
            {cartItems.length ? <span className="header-count">{cartItems.length}</span> : null}
          </Link>
          <button className="menu-toggle" type="button" onClick={() => setOpen((value) => !value)}>
            {open ? "Schliessen" : "Menue"}
          </button>
        </div>
      </div>
      {open ? (
        <>
          <button className="sheet-backdrop" type="button" aria-label="Menue schliessen" onClick={() => setOpen(false)} />
          <aside className="mobile-sheet">
            <div className="mobile-sheet-header">
              <strong>Shop-Menue</strong>
              <button type="button" onClick={() => setOpen(false)}>X</button>
            </div>
            <div className="mobile-sheet-links">
              {nav.concat([{ href: "/konto", label: "Mein Konto" }, { href: "/admin", label: "Admin" }]).map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="sheet-progress">
              <strong>{progress.unlocked ? "20% Set-Rabatt aktiv" : `Noch ${progress.itemsNeeded} Produkt${progress.itemsNeeded === 1 ? "" : "e"} bis zum Set`}</strong>
              <div className="progress-bar"><span style={{ width: `${progress.progressPercent}%` }} /></div>
              <Link href="/sets" className="primary-link" onClick={() => setOpen(false)}>Set-Vorteil ansehen</Link>
            </div>
          </aside>
        </>
      ) : null}
      <div className="mobile-category-row">
        {categories.slice(0, 4).map((category) => (
          <Link key={category.slug} href={category.slug === "sets" ? "/sets" : `/kategorie/${category.slug}`}>
            {category.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
