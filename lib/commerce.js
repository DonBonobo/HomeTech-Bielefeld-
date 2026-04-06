export function formatCurrency(cents) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function hydrateCart(items, products) {
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

export function mergeCartEntries(baseItems, incomingItems) {
  const map = new Map();
  for (const item of [...baseItems, ...incomingItems]) {
    const current = map.get(item.id) || 0;
    map.set(item.id, current + item.quantity);
  }
  return [...map.entries()].map(([id, quantity]) => ({ id, quantity }));
}
