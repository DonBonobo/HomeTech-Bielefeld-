import Link from "next/link";
import { CartLink } from "@/components/cart/cart-link";
import styles from "@/components/home/site-header.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.row}>
        <Link href="/" className={styles.logoLink} aria-label="HomeTech Bielefeld Startseite">
          <span className={styles.logoMark} aria-hidden="true">
            <svg viewBox="0 0 40 40" focusable="false">
              <path d="M7 18.5 20 7l13 11.5" />
              <path d="M12 17.5V31h16V17.5" />
              <path d="M17.5 23.5c1.2 1.6 3.8 1.6 5 0" />
            </svg>
          </span>
          <span className={styles.logoText}>
            <strong>HomeTech</strong>
            <span>Bielefeld</span>
          </span>
        </Link>

        <div className={styles.utilityArea}>
          <nav className={styles.utilityNav} aria-label="Service">
            <Link href="/" className={styles.utilityLink}>
              Support
            </Link>
            <span>Lieferung & Retouren</span>
            <span className={styles.locale}>
              <span aria-hidden="true">DE</span>
            </span>
            <span>Kontakt</span>
          </nav>

          <div className={styles.actions}>
            <Link href="/search?q=fischer" className={styles.searchLink}>
              Suche
            </Link>
            <CartLink />
          </div>
        </div>
      </div>
    </header>
  );
}
