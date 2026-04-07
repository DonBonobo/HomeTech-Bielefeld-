import Image from "next/image";
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
      </div>
    </header>
  );
}
