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
  const { user } = useAuth();
  const { categories } = useStorefront();
  const activeCategories = categories.filter((category) => category.enabled);

  return (
    <header className="site-header">
      <div className="topline">
        <span>Smarter Homes? Das gibt&apos;s doch nicht!</span>
        <span>PayPal · Versand in ganz Europa</span>
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
          {activeCategories.map((item) => (
            <Link key={item.slug} href={`/kategorie/${item.slug}`} className={pathname === `/kategorie/${item.slug}` ? "is-active" : ""}>
              {item.label}
            </Link>
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
        {activeCategories.map((category) => (
          <Link key={category.slug} href={`/kategorie/${category.slug}`} className={pathname === `/kategorie/${category.slug}` ? "is-active" : ""}>
            {category.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
