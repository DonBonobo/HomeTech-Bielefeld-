import { products } from "@/lib/catalog";

export const bundleRule = {
  minItems: 4,
  discountPercent: 20,
};

export function formatCurrency(cents) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function hydrateCart(items) {
  return items
    .map((entry) => {
      const product = products.find((item) => item.id === entry.id);
      return product ? { ...product, quantity: entry.quantity } : null;
    })
    .filter(Boolean);
}

export function bundleProgress(cartItems) {
  const quantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const qualifyingSubtotal = cartItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const discountCents = quantity >= bundleRule.minItems
    ? Math.round((qualifyingSubtotal * bundleRule.discountPercent) / 100)
    : 0;

  return {
    quantity,
    discountCents,
    itemsNeeded: Math.max(0, bundleRule.minItems - quantity),
    unlocked: quantity >= bundleRule.minItems,
    progressPercent: Math.min(100, (quantity / bundleRule.minItems) * 100),
  };
}

export function cartSubtotal(cartItems) {
  return cartItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}
