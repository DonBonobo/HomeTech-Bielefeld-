export function TrustStrip() {
  const items = [
    "Schneller Versand",
    "30 Tage Rueckgabe",
    "Rueckversand traegt der Verkaeufer",
    "Kombi-Versand immer moeglich",
  ];

  return (
    <section className="trust-row">
      {items.map((item) => <span key={item}>{item}</span>)}
    </section>
  );
}
