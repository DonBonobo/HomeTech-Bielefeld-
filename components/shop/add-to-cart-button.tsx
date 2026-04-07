"use client";

import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";

type AddToCartButtonProps = {
  product: {
    productId: string;
    slug: string;
    title: string;
    categoryLabel: string;
    spec: string;
    priceCents: number;
    imageUrl: string;
    stockCount: number;
  };
  className?: string;
  label?: string;
};

export function AddToCartButton({ product, className, label = "In den Warenkorb" }: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const currentQuantity = items.find((item) => item.productId === product.productId)?.quantity ?? 0;
  const isSoldOut = product.stockCount < 1;
  const isAtLimit = currentQuantity >= product.stockCount;
  const disabled = isSoldOut || isAtLimit;
  const buttonLabel = isSoldOut
    ? "Nicht verfügbar"
    : isAtLimit
      ? "Maximale Menge im Warenkorb"
      : added
        ? "Im Warenkorb"
        : label;

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        addItem(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
    >
      {buttonLabel}
    </button>
  );
}
