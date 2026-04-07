"use client";

import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";

export function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 14px",
        borderRadius: "999px",
        border: "1px solid var(--line)",
        background: "rgba(255,255,255,0.85)",
        color: "var(--text)",
        fontSize: "0.92rem",
        fontWeight: 600
      }}
    >
      Warenkorb
      <span
        style={{
          minWidth: "24px",
          height: "24px",
          display: "inline-grid",
          placeItems: "center",
          borderRadius: "999px",
          background: "var(--accent-soft)",
          color: "var(--accent-strong)",
          fontSize: "0.82rem"
        }}
      >
        {itemCount}
      </span>
    </Link>
  );
}
