export const categories = [
  { slug: "leuchtmittel", label: "Leuchtmittel" },
  { slug: "filament", label: "Filament" },
  { slug: "white-ambiance", label: "White Ambiance" },
  { slug: "white-and-color", label: "White & Color" },
  { slug: "sets", label: "Sets & Sparoptionen" },
];

export const products = [
  {
    id: "white-e14-candle-470",
    slug: "philips-hue-white-e14-kerze-470",
    title: "Philips Hue White E14 Kerze 470",
    categorySlug: "leuchtmittel",
    category: "Leuchtmittel",
    compatibility: ["Bluetooth", "Alexa", "Google Home"],
    short: "Warmweisses E14-Leuchtmittel fuer kleinere Leuchten und ruhige Abendstimmung.",
    description: "Kompaktes Hue White Leuchtmittel fuer Tischlampen, Fensterleuchten und kleine Fassungen. Schnell eingerichtet und angenehm warm im Alltag.",
    priceCents: 1699,
    stockLabel: "Auf Lager",
    image: "/assets/products/philips-hue-white-e14-candle-470.png",
    gallery: ["/assets/products/philips-hue-white-e14-candle-470.png"],
  },
  {
    id: "white-color-e14-candle-470",
    slug: "philips-hue-white-color-e14-kerze-470",
    title: "Philips Hue White & Color E14 Kerze 470",
    categorySlug: "white-and-color",
    category: "White & Color",
    compatibility: ["Bluetooth", "Alexa", "Google Home"],
    short: "Farbiges E14-Leuchtmittel fuer Akzente, Routinen und stimmungsvolle Szenen.",
    description: "Hue White and Color fuer kleinere Leuchten mit warmem Weiss, kuehlem Weiss und Farblicht in einem kompakten E14-Format.",
    priceCents: 2999,
    stockLabel: "Auf Lager",
    image: "/assets/products/philips-hue-white-color-e14-candle-470.png",
    gallery: ["/assets/products/philips-hue-white-color-e14-candle-470.png"],
  },
  {
    id: "white-e27-thin-filament-580",
    slug: "philips-hue-white-e27-thin-filament-580",
    title: "Philips Hue White E27 Filament 580",
    categorySlug: "filament",
    category: "Filament",
    compatibility: ["Bluetooth", "Alexa", "Google Home"],
    short: "Dekoratives Filament-Leuchtmittel mit warmem Licht fuer offene Fassungen.",
    description: "Schlanke Filamentform fuer sichtbare Leuchten, Sideboards und offene Pendel. Warmes Weiss, wohnlich und bewusst reduziert.",
    priceCents: 2299,
    stockLabel: "Auf Lager",
    image: "/assets/products/philips-hue-white-e27-thin-filament-580.png",
    gallery: ["/assets/products/philips-hue-white-e27-thin-filament-580.png"],
  },
  {
    id: "white-ambiance-e27-1100",
    slug: "philips-hue-white-ambiance-e27-1100",
    title: "Philips Hue White Ambiance E27 1100",
    categorySlug: "white-ambiance",
    category: "White Ambiance",
    compatibility: ["Matter", "Apple Home", "Google Home"],
    short: "Flexibles Weisslicht fuer Alltag, Abendlicht und konzentrierte Routinen.",
    description: "White Ambiance Leuchtmittel mit starker Helligkeit und variablem Weisslicht. Ideal fuer Wohnraum, Essbereich und Home-Office.",
    priceCents: 2499,
    stockLabel: "Auf Lager",
    image: "/assets/products/philips-hue-white-ambiance-e27-1100.png",
    gallery: ["/assets/products/philips-hue-white-ambiance-e27-1100.png"],
  },
  {
    id: "white-e14-filament-candle-300",
    slug: "philips-hue-white-e14-filament-kerze-300",
    title: "Philips Hue White Filament E14 Kerze 300",
    categorySlug: "filament",
    category: "Filament",
    compatibility: ["Bluetooth", "Alexa", "Google Home"],
    short: "Filament-Kerze fuer sichtbare Leuchten mit besonders sanftem Abendlicht.",
    description: "Dekorative Filament-Kerze fuer offene Wand- und Tischleuchten. Ruhiges Lichtbild fuer kleine Leuchten und klassische Fassungen.",
    priceCents: 1999,
    stockLabel: "Auf Lager",
    image: "/assets/products/philips-hue-white-e14-filament-candle-300.png",
    gallery: ["/assets/products/philips-hue-white-e14-filament-candle-300.png"],
  },
  {
    id: "white-e27-filament-550",
    slug: "philips-hue-white-e27-filament-550",
    title: "Philips Hue White E27 Filament 550",
    categorySlug: "filament",
    category: "Filament",
    compatibility: ["Bluetooth", "Alexa", "Google Home"],
    short: "Warme Filament-Optik fuer Wohnraeume mit offener oder halb-offener Fassung.",
    description: "Hue White Filament fuer sichtbare Tisch- und Pendelleuchten. Warmes Licht, dekorative Optik und unkomplizierte Steuerung.",
    priceCents: 2199,
    stockLabel: "Auf Lager",
    image: "/assets/products/philips-hue-white-e27-filament-550.png",
    gallery: ["/assets/products/philips-hue-white-e27-filament-550.png"],
  },
  {
    id: "white-color-e27-1100",
    slug: "philips-hue-white-color-e27-1100",
    title: "Philips Hue White & Color E27 1100",
    categorySlug: "white-and-color",
    category: "White & Color",
    compatibility: ["Matter", "Apple Home", "Google Home"],
    short: "Leistungsstarkes Farblicht fuer Wohnbereiche, Szenen und smarte Routinen.",
    description: "Hue White and Color mit hoher Helligkeit fuer Wohn- und Essbereich. Ideal, wenn Farblicht und klare Alltagsszenen zusammenkommen sollen.",
    priceCents: 4499,
    stockLabel: "Auf Lager",
    image: "/assets/products/philips-hue-white-color-e27-1100.png",
    gallery: ["/assets/products/philips-hue-white-color-e27-1100.png"],
  },
];

export function getProduct(slug) {
  return products.find((product) => product.slug === slug);
}

export function getCategoryProducts(slug) {
  if (slug === "leuchtmittel") {
    return products;
  }
  return products.filter((product) => product.categorySlug === slug);
}

export const bundles = [
  {
    id: "wohnlicht-set",
    title: "Wohnlicht-Set fuer den Alltag",
    description: "White Ambiance, White & Color und zwei Filament-Lampen fuer schnelle Set-Ersparnis.",
    items: ["white-ambiance-e27-1100", "white-color-e27-1100", "white-e27-filament-580", "white-e27-filament-550"],
    image: "/assets/products/philips-hue-white-ambiance-e27-1100.png",
  },
  {
    id: "kerzen-set",
    title: "Kerzen-Set fuer kleinere Leuchten",
    description: "Zwei E14 Kerzen plus zwei Filament-Varianten fuer Tisch- und Fensterleuchten.",
    items: ["white-e14-candle-470", "white-color-e14-candle-470", "white-e14-filament-candle-300", "white-e27-filament-580"],
    image: "/assets/products/philips-hue-white-color-e14-candle-470.png",
  },
];
