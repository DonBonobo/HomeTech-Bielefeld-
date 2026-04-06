"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useStorefront } from "@/components/providers/storefront-provider";

export function AdminConsole() {
  const { user, isAdmin } = useAuth();
  const {
    categories,
    products,
    source,
    upsertCategory,
    reorderCategory,
    updateProduct,
  } = useStorefront();

  const activeCategories = useMemo(() => categories, [categories]);

  if (!user) {
    return (
      <section className="section-block section-block--soft">
        <div className="section-header">
          <div>
            <p className="overline">Admin</p>
            <h1>Bitte zuerst anmelden</h1>
            <p>Der Admin bleibt bewusst klein. Nach der Anmeldung kannst du Kategorien und Produkte direkt auf dem Handy pflegen.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="section-block section-block--soft">
        <div className="section-header">
          <div>
            <p className="overline">Admin</p>
            <h1>Kein Zugriff</h1>
            <p>Dieser Bereich ist nur für freigegebene Administrationskonten sichtbar.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="page-stack">
      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="overline">Admin</p>
            <h1>Kategorien und Produkte verwalten</h1>
            <p>Datenquelle: {source === "supabase" ? "Supabase" : "lokaler Zustand"}</p>
          </div>
          <button
            type="button"
            className="secondary-link"
            onClick={() => upsertCategory({ label: "Neue Kategorie" })}
          >
            Kategorie hinzufügen
          </button>
        </div>
      </section>

      <section className="section-block section-block--soft">
        <div className="section-header">
          <div>
            <p className="overline">Kategorien</p>
            <h2>Reihenfolge und Sichtbarkeit</h2>
          </div>
        </div>
        <div className="admin-list">
          {activeCategories.map((category) => (
            <article key={category.id} className="admin-card">
              <input
                className="admin-input"
                value={category.label}
                onChange={(event) => upsertCategory({ id: category.id, label: event.target.value, enabled: category.enabled, position: category.position })}
              />
              <div className="admin-actions">
                <button type="button" className="secondary-link" onClick={() => reorderCategory(category.id, -1)}>Nach oben</button>
                <button type="button" className="secondary-link" onClick={() => reorderCategory(category.id, 1)}>Nach unten</button>
                <button
                  type="button"
                  className="secondary-link"
                  onClick={() => upsertCategory({ id: category.id, label: category.label, enabled: !category.enabled, position: category.position })}
                >
                  {category.enabled ? "Deaktivieren" : "Aktivieren"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block section-block--soft">
        <div className="section-header">
          <div>
            <p className="overline">Produkte</p>
            <h2>Kategorie, Preis, Bestand und Sichtbarkeit</h2>
          </div>
        </div>
        <div className="admin-list">
          {products.map((product) => (
            <article key={product.id} className="admin-card admin-card--product">
              <strong>{product.title}</strong>
              <label className="admin-field">
                <span>Kategorie</span>
                <select
                  className="admin-input"
                  value={product.categorySlug}
                  onChange={(event) => updateProduct(product.id, { categorySlug: event.target.value })}
                >
                  {activeCategories.map((category) => (
                    <option key={category.id} value={category.slug}>{category.label}</option>
                  ))}
                </select>
              </label>
              <label className="admin-field">
                <span>Preis in Cent</span>
                <input
                  className="admin-input"
                  type="number"
                  value={product.priceCents}
                  onChange={(event) => updateProduct(product.id, { priceCents: Number(event.target.value) || 0 })}
                />
              </label>
              <label className="admin-field">
                <span>Bestand</span>
                <input
                  className="admin-input"
                  type="number"
                  value={product.stockCount}
                  onChange={(event) => updateProduct(product.id, { stockCount: Number(event.target.value) || 0 })}
                />
              </label>
              <button
                type="button"
                className="secondary-link"
                onClick={() => updateProduct(product.id, { visible: !product.visible })}
              >
                {product.visible ? "Ausblenden" : "Einblenden"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
