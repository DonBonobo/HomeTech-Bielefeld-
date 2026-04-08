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
        minHeight: "36px",
        padding: "0 12px",
        borderRadius: "999px",
        border: "1px solid var(--line)",
        background: "var(--surface)",
        color: "var(--text)",
        fontSize: "0.82rem",
        fontWeight: 700
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
          background: "#eef3ff",
          color: "var(--accent-strong)",
          fontSize: "0.76rem"
        }}
      >
        {itemCount}
      </span>
    </Link>
  );
}
