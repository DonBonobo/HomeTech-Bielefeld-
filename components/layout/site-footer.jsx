import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-links">
          <Link href="/impressum">Impressum</Link>
          <Link href="/kontakt">Kontakt</Link>
          <Link href="/feedback">Feedback</Link>
        </div>
        <p>Alle Rechte vorbehalten. © HomeTech Bielefeld 2025</p>
      </div>
    </footer>
  );
}
