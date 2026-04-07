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
  };
  className?: string;
  label?: string;
};

export function AddToCartButton({ product, className, label = "In den Warenkorb" }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addItem(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
    >
      {added ? "Im Warenkorb" : label}
    </button>
  );
}
