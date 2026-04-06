const baseUrl = process.env.BASE_URL || "http://localhost:3000";

const checks = [
  { path: "/", marker: "Beliebte Leuchtmittel" },
  { path: "/kategorie/leuchtmittel", marker: "Leuchtmittel fuer dein Zuhause" },
  { path: "/produkt/philips-hue-white-ambiance-e27-1100", marker: "Philips Hue White Ambiance E27 1100" },
  { path: "/checkout", marker: "Sicher und direkt bezahlen" },
];

for (const check of checks) {
  const response = await fetch(`${baseUrl}${check.path}`);
  if (!response.ok) {
    throw new Error(`Route failed: ${check.path} -> ${response.status}`);
  }

  const html = await response.text();
  if (!html.includes(check.marker)) {
    throw new Error(`Marker missing for ${check.path}: ${check.marker}`);
  }
}

console.log(`Smoke checks passed for ${baseUrl}`);
