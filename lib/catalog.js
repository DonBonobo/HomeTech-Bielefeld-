export const categories = [
  { slug: "leuchtmittel", label: "Leuchtmittel" },
  { slug: "schalter-fernbedienungen", label: "Smarte Schalter" },
  { slug: "steckdosen", label: "Smarte Steckdosen" },
  { slug: "sensoren", label: "Sensoren" },
  { slug: "zubehoer", label: "Philips Hue Zubehoer" },
  { slug: "sets", label: "Sets & Sparoptionen" },
];

export const products = [
  {
    id: "dimmer-switch",
    slug: "philips-hue-dimmer-switch",
    title: "Philips Hue Dimmer Switch",
    categorySlug: "schalter-fernbedienungen",
    category: "Smarte Schalter",
    compatibility: ["Matter", "Apple Home", "Google Home"],
    short: "Kabelloser Szenenwechsel fuer Hue Wohnraeume.",
    description: "Kabelloser Dimmer fuer schnelle Szenenwechsel, klaren Wand-Look und saubere Bedienung im Alltag.",
    priceCents: 2499,
    stockLabel: "Auf Lager",
    image: "/assets/products/philips-hue-dimmer-switch.png",
    gallery: ["/assets/products/philips-hue-dimmer-switch.png", "/assets/products/file_00000000c69c720abe245c468b829ddc.png"],
  },
  {
    id: "smart-plug",
    slug: "philips-hue-smart-plug",
    title: "Philips Hue Smart Plug",
    categorySlug: "steckdosen",
    category: "Smarte Steckdosen",
    compatibility: ["Hue Bridge", "Alexa", "Google Home"],
    short: "Smarte Steckdose fuer Lampen und kleine Geraete.",
    description: "Hue Smart Plug fuer Lampen und kleine Geraete mit schneller Einrichtung und klarer Kompatibilitaet.",
    priceCents: 2999,
    stockLabel: "Auf Lager",
    image: "/assets/products/philips-hue-smart-plug.png",
    gallery: ["/assets/products/philips-hue-smart-plug.png", "/assets/products/file_000000005338720998449201d455af76.png"],
  },
  {
    id: "white-gu10",
    slug: "philips-hue-white-ambiance-gu10",
    title: "Philips Hue White Ambiance GU10",
    categorySlug: "leuchtmittel",
    category: "Leuchtmittel",
    compatibility: ["Matter", "Apple Home", "Google Home"],
    short: "Warm bis kuehlweiss fuer Alltag und Stimmung.",
    description: "GU10 Leuchtmittel fuer Wohnraeume, Kueche und Flur mit sauberem Weisslicht-Fokus.",
    priceCents: 1999,
    stockLabel: "Auf Lager",
    image: "/assets/products/philips-hue-white-ambiance-gu10.png",
    gallery: ["/assets/products/philips-hue-white-ambiance-gu10.png", "/assets/products/file_000000002ff8720a83e6177611a7b2ac.png"],
  },
  {
    id: "tap-dial-white",
    slug: "philips-hue-tap-dial-switch-weiss",
    title: "Philips Hue Tap Dial Switch Weiss",
    categorySlug: "schalter-fernbedienungen",
    category: "Smarte Schalter",
    compatibility: ["Matter", "Apple Home", "Google Home"],
    short: "Drehregler fuer Szenen, Zonen und Helligkeit.",
    description: "Tap Dial fuer saubere Lichtsteuerung mit echter Haptik und schneller Szenenauswahl.",
    priceCents: 4999,
    stockLabel: "Auf Lager",
    image: "/assets/products/philips-hue-tap-dial-white.png",
    gallery: ["/assets/products/philips-hue-tap-dial-white.png", "/assets/products/file_00000000f1d07243b0779a635574f5f7.png"],
  },
  {
    id: "tap-dial-black",
    slug: "philips-hue-tap-dial-switch-schwarz",
    title: "Philips Hue Tap Dial Switch Schwarz",
    categorySlug: "schalter-fernbedienungen",
    category: "Smarte Schalter",
    compatibility: ["Matter", "Apple Home", "Google Home"],
    short: "Dunkle Variante fuer moderne Wohnraeume.",
    description: "Tap Dial in Schwarz fuer moderne Innenraeume und saubere Szenensteuerung.",
    priceCents: 4999,
    stockLabel: "Wenig Bestand",
    image: "/assets/products/philips-hue-tap-dial-black.png",
    gallery: ["/assets/products/philips-hue-tap-dial-black.png", "/assets/products/file_00000000f2c071f9afe5965d4706db07.png"],
  },
  {
    id: "wall-module",
    slug: "philips-hue-wall-switch-module",
    title: "Philips Hue Wall Switch Module",
    categorySlug: "zubehoer",
    category: "Philips Hue Zubehoer",
    compatibility: ["Hue Bridge", "Matter", "Apple Home"],
    short: "Macht vorhandene Wandschalter smart.",
    description: "Wandschalter-Modul fuer bestehende Installationen, ohne den gewohnten Lichtschalter aufzugeben.",
    priceCents: 4299,
    stockLabel: "Auf Lager",
    image: "/assets/products/philips-hue-wall-switch-module.png",
    gallery: ["/assets/products/philips-hue-wall-switch-module.png", "/assets/products/file_0000000093307246a3c09c547826ddb7.png"],
  },
];

export function getProduct(slug) {
  return products.find((product) => product.slug === slug);
}

export function getCategoryProducts(slug) {
  return products.filter((product) => product.categorySlug === slug);
}

export const bundles = [
  {
    id: "wohnzimmer-set",
    title: "Philips Hue Wohnzimmer-Set",
    description: "2 x Tap Dial, Smart Plug und GU10 fuer den schnellen Einstieg.",
    items: ["tap-dial-white", "tap-dial-black", "smart-plug", "white-gu10"],
    image: "/assets/references/wf5.png",
  },
  {
    id: "starter-set",
    title: "Philips Hue Starter-Set",
    description: "Dimmer Switch, Smart Plug, GU10 und Wall Switch Module.",
    items: ["dimmer-switch", "smart-plug", "white-gu10", "wall-module"],
    image: "/assets/products/file_000000005338720998449201d455af76.png",
  },
];
