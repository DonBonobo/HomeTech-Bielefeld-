import Link from "next/link";

export function HomeHero() {
  return (
    <section className="hero-shell">
      <div className="hero-search" aria-hidden="true">
        <span className="hero-search-icon">⌕</span>
        <span>Hue Leuchtmittel suchen...</span>
      </div>

      <div className="hero-card hero-card--quiet">
        <div className="hero-copy">
          <p className="overline">HomeTech Bielefeld</p>
          <h1>Smartes Licht fuer den Launch, klar kuratiert.</h1>
          <p>
            White, White Ambiance, White & Color und Filament. Wenige gute Hue-Produkte,
            sauber praesentiert und direkt fuer dein 4er-Set vorbereitet.
          </p>
          <div className="hero-actions">
            <Link href="/kategorie/leuchtmittel" className="primary-link">Launch-Produkte ansehen</Link>
            <Link href="/sets" className="secondary-link">20% Set-Rabatt</Link>
          </div>
        </div>

        <div className="hero-stage" aria-hidden="true">
          <div className="hero-stage-glow" />
          <img className="hero-stage-main" src="/assets/products/philips-hue-white-color-e27-1100.png" alt="" />
          <img className="hero-stage-side" src="/assets/products/philips-hue-white-e14-candle-470.png" alt="" />
          <img className="hero-stage-tall" src="/assets/products/philips-hue-white-ambiance-e27-1100.png" alt="" />
        </div>
      </div>
    </section>
  );
}
