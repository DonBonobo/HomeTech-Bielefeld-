import { products } from "@/lib/catalog";

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

export function cartSubtotal(cartItems) {
  return cartItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}
