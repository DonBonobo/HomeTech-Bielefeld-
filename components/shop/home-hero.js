import Image from "next/image";

export function HomeHero() {
  return (
    <section className="hero-shell">
      <div className="hero-card hero-card--quiet">
        <div className="hero-copy">
          <p className="overline">HomeTech Bielefeld</p>
          <h1>Lass dein Zuhause smarter leuchten.</h1>
          <p>Originale Hue Leuchtmittel, klar ausgewählt und direkt bestellbar.</p>
        </div>

        <div className="hero-banner-frame">
          <Image
            src="/assets/banner-home.png"
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
