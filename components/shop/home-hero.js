import Image from "next/image";
import { CategoryShortcuts } from "@/components/shop/category-shortcuts";

export function HomeHero() {
  return (
    <section className="hero-shell">
      <div className="hero-card hero-card--quiet hero-card--storefront">
        <div className="hero-copy">
          <p className="overline">Philips Hue</p>
          <h1>Smart Home. Beste Qualität.</h1>
          <p>Originale Hue Leuchtmittel und Zubehör für ein ruhiges, verlässliches Zuhause.</p>
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

        <CategoryShortcuts />
      </div>
    </section>
  );
}
