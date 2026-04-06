"use client";

import { useCart } from "@/components/providers/cart-provider";

export function AddToCartButton({ productId, label = "In den Warenkorb", className = "primary-action" }) {
  const { addItem } = useCart();

  return (
    <button type="button" className={className} onClick={() => addItem(productId)}>
      {label}
    </button>
  );
}
