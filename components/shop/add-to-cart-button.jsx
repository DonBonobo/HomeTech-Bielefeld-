"use client";

import { useCart } from "@/components/providers/cart-provider";

export function AddToCartButton({ productId, label = "In den Warenkorb", className = "primary-action" }) {
  const { addItem, getQuantity, updateQuantity } = useCart();
  const quantity = getQuantity(productId);

  if (quantity > 0) {
    return (
      <div className="quantity-stepper" aria-label="Menge im Warenkorb">
        <button type="button" className="quantity-stepper-button" onClick={() => updateQuantity(productId, -1)}>
          −
        </button>
        <span className="quantity-stepper-value">{quantity}</span>
        <button type="button" className="quantity-stepper-button" onClick={() => updateQuantity(productId, 1)}>
          +
        </button>
      </div>
    );
  }

  return (
    <button type="button" className={className} onClick={() => addItem(productId)}>
      {label}
    </button>
  );
}
