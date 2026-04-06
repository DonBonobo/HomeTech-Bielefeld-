"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { hydrateCart, mergeCartEntries } from "@/lib/commerce";
import { useAuth } from "@/components/providers/auth-provider";
import { useStorefront } from "@/components/providers/storefront-provider";
import { getVisualPreview } from "@/lib/visual-preview";

const CartContext = createContext(null);
const GUEST_STORAGE_KEY = "hometech.next.cart.guest.v2";
const USER_STORAGE_PREFIX = "hometech.next.cart.user.";

function getUserStorageKey(userId) {
  return `${USER_STORAGE_PREFIX}${userId}`;
}

function readStorage(key) {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]");
  } catch (_error) {
    return [];
  }
}

function writeStorage(key, items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

async function readServerCart(supabase, userId) {
  if (!supabase || !userId) {
    return { items: null, supported: false };
  }

  const { data: cartRow, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (cartError) {
    return { items: null, supported: false };
  }

  if (!cartRow) {
    return { items: [], supported: true };
  }

  const { data: itemRows, error: itemError } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("cart_id", cartRow.id);

  if (itemError) {
    return { items: null, supported: false };
  }

  return {
    supported: true,
    items: (itemRows || []).map((item) => ({ id: item.product_id, quantity: item.quantity })),
  };
}

async function writeServerCart(supabase, userId, items) {
  if (!supabase || !userId) {
    return false;
  }

  const { data: cartRow, error: cartError } = await supabase
    .from("carts")
    .upsert({ user_id: userId }, { onConflict: "user_id" })
    .select("id")
    .single();

  if (cartError || !cartRow) {
    return false;
  }

  const cartId = cartRow.id;

  const { error: deleteError } = await supabase.from("cart_items").delete().eq("cart_id", cartId);
  if (deleteError) {
    return false;
  }

  if (!items.length) {
    return true;
  }

  const payload = items.map((item) => ({
    cart_id: cartId,
    product_id: item.id,
    quantity: item.quantity,
  }));

  const { error: insertError } = await supabase.from("cart_items").insert(payload);
  return !insertError;
}

export function CartProvider({ children }) {
  const { supabase, user, ready: authReady } = useAuth();
  const { products } = useStorefront();
  const [items, setItems] = useState([]);
  const [booted, setBooted] = useState(false);
  const previousUserId = useRef(undefined);
  const serverSupported = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadCartState() {
      if (!authReady) {
        return;
      }

      const preview = getVisualPreview();
      if (preview?.cart) {
        previousUserId.current = user?.id || null;
        setItems(preview.cart);
        setBooted(true);
        return;
      }

      const currentUserId = user?.id || null;
      const previous = previousUserId.current;
      let nextItems = [];
      const guestItems = readStorage(GUEST_STORAGE_KEY);

      if (!currentUserId) {
        nextItems = guestItems;
      } else {
        const storedUserItems = readStorage(getUserStorageKey(currentUserId));
        const serverCart = await readServerCart(supabase, currentUserId);
        serverSupported.current = serverCart.supported;

        if (previous === undefined) {
          const baseItems = serverCart.supported ? (serverCart.items || []) : storedUserItems;
          nextItems = mergeCartEntries(baseItems, guestItems);
          writeStorage(getUserStorageKey(currentUserId), nextItems);
          if (guestItems.length) {
            writeStorage(GUEST_STORAGE_KEY, []);
          }
          if (serverCart.supported) {
            await writeServerCart(supabase, currentUserId, nextItems);
          }
        } else if (!previous && currentUserId) {
          const merged = serverCart.supported
            ? mergeCartEntries(serverCart.items || [], guestItems)
            : mergeCartEntries(storedUserItems, guestItems);
          nextItems = merged;
          writeStorage(getUserStorageKey(currentUserId), merged);
          writeStorage(GUEST_STORAGE_KEY, []);
          if (serverCart.supported) {
            await writeServerCart(supabase, currentUserId, merged);
          }
        } else if (previous === currentUserId) {
          nextItems = serverCart.supported ? (serverCart.items || storedUserItems) : storedUserItems;
        } else {
          nextItems = serverCart.supported ? (serverCart.items || []) : storedUserItems;
        }
      }

      if (!active) {
        return;
      }

      previousUserId.current = currentUserId;
      setItems(nextItems);
      setBooted(true);
    }

    loadCartState();
    return () => {
      active = false;
    };
  }, [authReady, supabase, user?.id]);

  useEffect(() => {
    if (!booted) {
      return;
    }

    const currentUserId = user?.id || null;
    if (!currentUserId) {
      writeStorage(GUEST_STORAGE_KEY, items);
      return;
    }

    writeStorage(getUserStorageKey(currentUserId), items);
    if (serverSupported.current) {
      writeServerCart(supabase, currentUserId, items);
    }
  }, [booted, items, supabase, user?.id]);

  const value = useMemo(() => {
    const cartItems = hydrateCart(items, products);

    return {
      rawItems: items,
      cartItems,
      getQuantity(productId) {
        return currentQuantity(items, productId);
      },
      addItem(productId) {
        setItems((current) => {
          const existing = current.find((item) => item.id === productId);
          if (existing) {
            return current.map((item) => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item);
          }
          return [...current, { id: productId, quantity: 1 }];
        });
      },
      updateQuantity(productId, delta) {
        setItems((current) =>
          current
            .map((item) => item.id === productId ? { ...item, quantity: item.quantity + delta } : item)
            .filter((item) => item.quantity > 0)
        );
      },
      replaceCart(nextItems) {
        setItems(nextItems);
      },
    };
  }, [items, products]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

function currentQuantity(items, productId) {
  return items.find((item) => item.id === productId)?.quantity || 0;
}
