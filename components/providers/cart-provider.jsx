"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { hydrateCart, bundleProgress } from "@/lib/commerce";

const CartContext = createContext(null);
const STORAGE_KEY = "hometech.next.cart.v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (_error) {}
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const cartItems = hydrateCart(items);
    const progress = bundleProgress(cartItems);

    return {
      rawItems: items,
      cartItems,
      progress,
      addItem(productId) {
        setItems((current) => {
          const existing = current.find((item) => item.id === productId);
          if (existing) {
            return current.map((item) => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item);
          }
          return [...current, { id: productId, quantity: 1 }];
        });
      },
      addBundle(productIds) {
        setItems((current) => {
          const next = [...current];
          productIds.forEach((productId) => {
            const existing = next.find((item) => item.id === productId);
            if (existing) {
              existing.quantity += 1;
            } else {
              next.push({ id: productId, quantity: 1 });
            }
          });
          return [...next];
        });
      },
      updateQuantity(productId, delta) {
        setItems((current) =>
          current
            .map((item) => item.id === productId ? { ...item, quantity: item.quantity + delta } : item)
            .filter((item) => item.quantity > 0)
        );
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
