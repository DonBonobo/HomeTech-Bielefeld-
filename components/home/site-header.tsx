import Image from "next/image";
import Link from "next/link";
import { CartLink } from "@/components/cart/cart-link";
import styles from "@/components/home/homepage.module.css";

export function SiteHeader() {
  return (
    <header className={styles.section}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          padding: "8px 2px 0"
        }}
      >
        <Image
          src="/assets/brand/hometech-bielefeld-logo-horizontal.png"
          alt="HomeTech Bielefeld"
          width={270}
          height={86}
          priority
        />
        <div style={{ display: "grid", gap: "10px", justifyItems: "end" }}>
          <div
            style={{
              display: "grid",
              gap: "2px",
              justifyItems: "end",
              color: "var(--muted)",
              fontSize: "0.82rem",
              textAlign: "right"
            }}
          >
            <strong style={{ color: "var(--text)" }}>Bielefeld Lagerbestand</strong>
            <span>Same-Day lokal, Preise inkl. MwSt.</span>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link
              href="/search?q=fischer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 14px",
                borderRadius: "999px",
                border: "1px solid var(--line)",
                background: "rgba(255,255,255,0.85)",
                color: "var(--text)",
                fontSize: "0.92rem"
              }}
            >
              Suche
            </Link>
            <CartLink />
          </div>
        </div>
      </div>
    </header>
  );
}
