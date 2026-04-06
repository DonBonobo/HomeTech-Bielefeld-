import Image from "next/image";
import Link from "next/link";

export function HomeHero() {
  return (
    <section className="hero-shell">
      <div className="hero-card hero-card--quiet">
        <div className="hero-copy">
          <p className="overline">HomeTech Bielefeld</p>
          <h1>Lass dein Zuhause smarter leuchten.</h1>
          <p>
            Perfekt kuratierte Hue-Produkte fuer deinen Start.
          </p>
          <div className="hero-actions">
            <Link href="/kategorie/leuchtmittel" className="primary-link">Jetzt einkaufen</Link>
          </div>
        </div>

        <div className="hero-banner-frame">
          <Image
            src="/assets/banner-launch-home.png"
            alt="Philips Hue Leuchtmittel in einer Wohnraumszene"
            width={1440}
            height={900}
            className="hero-banner-image"
            priority
          />
        </div>
      </div>
    </section>
  );
}
