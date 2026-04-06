"use client";

import Link from "next/link";
import { useStorefront } from "@/components/providers/storefront-provider";

const ICONS = {
  leuchtmittel: "◔",
  schalter: "◫",
  hubs: "◎",
};

export function CategoryShortcuts({ compact = false }) {
  const { categories } = useStorefront();
  const activeCategories = categories.filter((category) => category.enabled);

  return (
    <div className={`category-shortcuts${compact ? " category-shortcuts--compact" : ""}`}>
      {activeCategories.map((category) => (
        <Link key={category.slug} href={`/kategorie/${category.slug}`} className="category-shortcut">
          <span className="category-shortcut-icon" aria-hidden="true">
            {ICONS[category.slug] || "•"}
          </span>
          <span>{category.label}</span>
        </Link>
      ))}
    </div>
  );
}
