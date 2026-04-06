"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { seedCategories, seedProducts } from "@/lib/storefront-seed";
import { useAuth } from "@/components/providers/auth-provider";

const StorefrontContext = createContext(null);
const STOREFRONT_STORAGE_KEY = "hometech.storefront.v1";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[ä]/g, "ae")
    .replace(/[ö]/g, "oe")
    .replace(/[ü]/g, "ue")
    .replace(/[ß]/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCategories(categories) {
  return [...categories]
    .map((item, index) => ({
      id: item.id || `category-${index}`,
      slug: item.slug || slugify(item.label || `kategorie-${index}`),
      label: item.label || `Kategorie ${index + 1}`,
      enabled: item.enabled !== false,
      position: typeof item.position === "number" ? item.position : index,
    }))
    .sort((a, b) => a.position - b.position);
}

function normalizeProducts(products, categories) {
  const categoryMap = new Map(categories.map((category) => [category.slug, category.label]));

  return products.map((product) => ({
    ...product,
    categorySlug: product.categorySlug || "leuchtmittel",
    category: categoryMap.get(product.categorySlug || "leuchtmittel") || product.category || "Leuchtmittel",
    visible: product.visible !== false,
    stockCount: typeof product.stockCount === "number" ? product.stockCount : 0,
    stockLabel: typeof product.stockCount === "number"
      ? (product.stockCount > 0 ? "Auf Lager" : "Nicht auf Lager")
      : (product.stockLabel || "Auf Lager"),
  }));
}

export function StorefrontProvider({ children }) {
  const { supabase, user } = useAuth();
  const [categories, setCategories] = useState(seedCategories);
  const [products, setProducts] = useState(seedProducts);
  const [source, setSource] = useState("seed");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadState() {
      let nextCategories = seedCategories;
      let nextProducts = seedProducts;
      let nextSource = "seed";

      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(STOREFRONT_STORAGE_KEY);
        if (stored) {
          try {
            const payload = JSON.parse(stored);
            if (Array.isArray(payload.categories) && Array.isArray(payload.products)) {
              nextCategories = payload.categories;
              nextProducts = payload.products;
              nextSource = "state";
            }
          } catch (_error) {}
        }
      }

      if (supabase) {
        const { data: categoryRows, error: categoryError } = await supabase
          .from("categories")
          .select("*")
          .order("position", { ascending: true });

        if (!categoryError && Array.isArray(categoryRows)) {
          const { data: productRows, error: productError } = await supabase
            .from("products")
            .select("*")
            .order("title", { ascending: true });

          if (!productError && Array.isArray(productRows)) {
            nextCategories = categoryRows;
            nextProducts = productRows;
            nextSource = "supabase";
          }
        }
      }

      if (!active) return;

      const normalizedCategories = normalizeCategories(nextCategories);
      const normalizedProducts = normalizeProducts(nextProducts, normalizedCategories);
      setCategories(normalizedCategories);
      setProducts(normalizedProducts);
      setSource(nextSource);
      setReady(true);
    }

    loadState();
    return () => {
      active = false;
    };
  }, [supabase, user?.id]);

  useEffect(() => {
    if (!ready || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STOREFRONT_STORAGE_KEY, JSON.stringify({ categories, products }));
  }, [categories, products, ready]);

  const value = useMemo(() => ({
    categories,
    products,
    source,
    ready,
    visibleProducts: products.filter((product) => product.visible !== false),
    getCategory(slug) {
      return categories.find((category) => category.slug === slug) || null;
    },
    getProduct(slug) {
      return products.find((product) => product.slug === slug) || null;
    },
    getCategoryProducts(slug) {
      return products.filter((product) => product.visible !== false && product.categorySlug === slug);
    },
    upsertCategory(input) {
      setCategories((current) => {
        const exists = current.some((category) => category.id === input.id);
        const next = exists
          ? current.map((category) => category.id === input.id ? { ...category, ...input, slug: slugify(input.label || category.label) } : category)
          : [...current, {
              id: input.id || `category-${Date.now()}`,
              label: input.label || "Neue Kategorie",
              slug: slugify(input.label || "neue-kategorie"),
              enabled: input.enabled !== false,
              position: current.length,
            }];
        return normalizeCategories(next);
      });
    },
    deleteCategory(categoryId) {
      setCategories((current) => normalizeCategories(current.filter((category) => category.id !== categoryId)));
      setProducts((current) => current.map((product) => product.categorySlug === categoryId ? { ...product, categorySlug: "leuchtmittel", category: "Leuchtmittel" } : product));
    },
    reorderCategory(categoryId, direction) {
      setCategories((current) => {
        const sorted = normalizeCategories(current);
        const index = sorted.findIndex((item) => item.id === categoryId);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= sorted.length) {
          return sorted;
        }
        const next = [...sorted];
        [next[index], next[target]] = [next[target], next[index]];
        return normalizeCategories(next.map((item, idx) => ({ ...item, position: idx })));
      });
    },
    updateProduct(productId, patch) {
      setProducts((current) => normalizeProducts(
        current.map((product) => {
          if (product.id !== productId) return product;
          const next = { ...product, ...patch };
          if (patch.categorySlug) {
            const category = categories.find((entry) => entry.slug === patch.categorySlug);
            next.category = category?.label || product.category;
          }
          if (typeof next.stockCount === "number") {
            next.stockLabel = next.stockCount > 0 ? "Auf Lager" : "Nicht auf Lager";
          }
          return next;
        }),
        categories
      ));
    },
  }), [categories, products, ready, source]);

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error("useStorefront must be used within StorefrontProvider");
  }
  return context;
}
