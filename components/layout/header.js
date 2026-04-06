"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/lib/catalog";
import { useCart } from "@/components/providers/cart-provider";

export function Header() {
  const pathname = usePathname();
  const { cartItems } = useCart();

  return (
    <header className="site-header">
      <div className="topline">
        <span>Smarter Homes? Das gibt&apos;s doch nicht!</span>
        <span>PayPal zum Launch · Versand in ganz Europa</span>
      </div>
      <div className="header-row">
        <Link href="/" className="brand-link">
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
          {categories.map((item) => (
            item.enabled ? (
              <Link key={item.slug} href={`/kategorie/${item.slug}`} className={pathname === `/kategorie/${item.slug}` ? "is-active" : ""}>
                {item.label}
              </Link>
            ) : (
              <span key={item.slug} className="desktop-nav-disabled">{item.label}</span>
            )
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/checkout" className="cart-button">
            <span>Warenkorb</span>
            {cartItems.length ? <span className="header-count">{cartItems.length}</span> : null}
          </Link>
          <Link href="/konto" className="account-button" aria-label="Konto">
            <span className="account-avatar" />
          </Link>
        </div>
      </div>
      <div className="mobile-category-row">
        {categories.map((category) => (
          category.enabled ? (
            <Link key={category.slug} href={`/kategorie/${category.slug}`} className={pathname === `/kategorie/${category.slug}` ? "is-active" : ""}>
              {category.label}
            </Link>
          ) : (
            <span key={category.slug} className="category-pill-disabled">{category.label}</span>
          )
        ))}
      </div>
    </header>
  );
}
