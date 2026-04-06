import Link from "next/link";

export function HomeHero() {
  return (
    <section className="hero-shell">
      <div className="hero-search" aria-hidden="true">
        <span className="hero-search-icon">⌕</span>
        <span>Produkte suchen...</span>
      </div>

      <div className="hero-card hero-card--quiet">
        <div className="hero-copy">
          <p className="overline">HomeTech Bielefeld</p>
          <h1>Smart-Home Zubehoer mit Klarheit und schneller Lieferung.</h1>
          <p>
            Entdecke ausgewaehlte Schalter, Sensoren und smarte Lampen fuer dein intelligentes Zuhause.
            Leicht verstaendlich, einfach bestellbar und ideal fuer den Alltag.
          </p>
          <div className="hero-actions">
            <Link href="/kategorie/leuchtmittel" className="primary-link">Jetzt entdecken</Link>
            <Link href="/sets" className="secondary-link">Zum Set-Vorteil</Link>
          </div>
        </div>

        <div className="hero-stage" aria-hidden="true">
          <div className="hero-stage-glow" />
          <img className="hero-stage-main" src="/assets/products/philips-hue-white-ambiance-gu10.png" alt="" />
          <img className="hero-stage-side" src="/assets/products/philips-hue-smart-plug.png" alt="" />
          <img className="hero-stage-tall" src="/assets/products/philips-hue-wall-switch-module.png" alt="" />
        </div>
      </div>
    </section>
  );
}
