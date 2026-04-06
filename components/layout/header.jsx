"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useStorefront } from "@/components/providers/storefront-provider";

export function Header() {
  const pathname = usePathname();
  const { cartItems } = useCart();
  const { isAdmin } = useAuth();
  const { categories } = useStorefront();
  const activeCategories = categories.filter((category) => category.enabled);

  return (
    <header className="site-header" data-testid="site-header">
      <div className="topline">
        <span>HomeTech Bielefeld</span>
        <span>Auch auf eBay</span>
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
              <small>Auch auf eBay</small>
            </span>
          </span>
        </Link>
        <nav className="desktop-nav">
          {activeCategories.map((item) => (
            <Link key={item.slug} href={`/kategorie/${item.slug}`} className={pathname === `/kategorie/${item.slug}` ? "is-active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          {isAdmin ? (
            <Link href="/admin" className="account-button account-button--admin" aria-label="Admin">
              <span className="account-avatar account-avatar--admin">A</span>
            </Link>
          ) : null}
          <Link href="/checkout" className="cart-button">
            <span>Warenkorb</span>
            {cartItems.length ? <span className="header-count">{cartItems.length}</span> : null}
          </Link>
          <Link href="/konto" className="account-button" aria-label="Konto">
            <span className="account-avatar" />
          </Link>
        </div>
      </div>
      <div className="mobile-category-row" data-testid="category-row">
        {activeCategories.map((category) => (
          <Link key={category.slug} href={`/kategorie/${category.slug}`} className={pathname === `/kategorie/${category.slug}` ? "is-active" : ""}>
            {category.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
