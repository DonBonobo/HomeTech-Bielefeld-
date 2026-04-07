"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { seedCategories, seedProducts } from "@/lib/storefront-seed";
import { useAuth } from "@/components/providers/auth-provider";

const StorefrontContext = createContext(null);

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

function createCategoryId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `00000000-0000-4000-8000-${Math.random().toString(16).slice(2, 14).padEnd(12, "0")}`;
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

async function readSupabaseStorefront(supabase) {
  if (!supabase) {
    return { supported: false };
  }

  const { data: categoryRows, error: categoryError } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });

  if (categoryError) {
    return { supported: false };
  }

  const { data: productRows, error: productError } = await supabase
    .from("products")
    .select("*")
    .order("title", { ascending: true });

  if (productError) {
    return { supported: false };
  }

  const { data: imageRows, error: imageError } = await supabase
    .from("product_images")
    .select("product_id, image_url, alt_text, position")
    .order("position", { ascending: true });

  const imageMap = new Map();
  if (!imageError) {
    for (const row of imageRows || []) {
      const current = imageMap.get(row.product_id) || [];
      current.push({
        src: row.image_url,
        alt: row.alt_text || null,
      });
      imageMap.set(row.product_id, current);
    }
  }

  return {
    supported: true,
    categories: categoryRows || [],
    products: (productRows || []).map((product) => ({
      ...product,
      categorySlug: product.category_slug,
      priceCents: product.price_cents,
      stockCount: product.stock_count,
      gallery: imageMap.get(product.id) || product.gallery || [],
      compatibility: product.compatibility || [],
    })),
  };
}

async function writeSupabaseCategories(supabase, categories) {
  if (!supabase) return false;
  const payload = categories.map((category, index) => ({
    id: category.id,
    slug: category.slug,
    label: category.label,
    enabled: category.enabled,
    position: index,
  }));

  const { error } = await supabase.from("categories").upsert(payload);
  return !error;
}

async function writeSupabaseProducts(supabase, products) {
  if (!supabase) return false;
  const payload = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    title: product.title,
    category_slug: product.categorySlug,
    line: product.line,
    spec: product.spec,
    short: product.short,
    description: product.description,
    price_cents: product.priceCents,
    stock_count: product.stockCount,
    visible: product.visible,
    image: product.image,
    gallery: product.gallery,
    compatibility: product.compatibility,
  }));

  const { error } = await supabase.from("products").upsert(payload);
  return !error;
}

async function writeSupabaseProductImages(supabase, products) {
  if (!supabase) return false;

  const productIds = products.map((product) => product.id);
  const { error: deleteError } = await supabase.from("product_images").delete().in("product_id", productIds);
  if (deleteError) {
    return false;
  }

  const payload = products.flatMap((product) =>
    (product.gallery || []).map((image, index) => ({
      product_id: product.id,
      image_url: typeof image === "string" ? image : image.src,
      alt_text: typeof image === "string" ? null : (image.alt || null),
      position: index,
    }))
  );

  if (!payload.length) {
    return true;
  }

  const { error } = await supabase.from("product_images").insert(payload);
  return !error;
}

export function StorefrontProvider({ children }) {
  const { supabase, isAdmin } = useAuth();
  const [categories, setCategories] = useState(seedCategories);
  const [products, setProducts] = useState(seedProducts);
  const [source, setSource] = useState("seed");
  const [ready, setReady] = useState(false);
  const supabaseSupported = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadState() {
      let nextCategories = seedCategories;
      let nextProducts = seedProducts;
      let nextSource = "seed";

      if (supabase) {
        const result = await readSupabaseStorefront(supabase);
        if (result.supported) {
          nextCategories = result.categories;
          nextProducts = result.products;
          nextSource = "supabase";
        }
      }

      if (!active) return;

      const normalizedCategories = normalizeCategories(nextCategories);
      const normalizedProducts = normalizeProducts(nextProducts, normalizedCategories);
      setCategories(normalizedCategories);
      setProducts(normalizedProducts);
      setSource(nextSource);
      supabaseSupported.current = nextSource === "supabase";
      setReady(true);
    }

    loadState();
    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (supabase && supabaseSupported.current && isAdmin) {
      writeSupabaseCategories(supabase, categories);
      writeSupabaseProducts(supabase, products);
      writeSupabaseProductImages(supabase, products);
    }
  }, [categories, products, ready, supabase, isAdmin]);

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
              id: input.id || createCategoryId(),
              label: input.label || "Neue Kategorie",
              slug: slugify(input.label || "neue-kategorie"),
              enabled: input.enabled !== false,
              position: current.length,
            }];
        return normalizeCategories(next);
      });
    },
    deleteCategory(categoryId) {
      const category = categories.find((entry) => entry.id === categoryId);
      setCategories((current) => normalizeCategories(current.filter((entry) => entry.id !== categoryId)));
      setProducts((current) => current.map((product) => product.categorySlug === category?.slug ? { ...product, categorySlug: "leuchtmittel", category: "Leuchtmittel" } : product));
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
    persistenceMode: supabaseSupported.current ? "supabase" : source,
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
