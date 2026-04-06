export function TrustStrip() {
  const items = [
    { label: "Schneller Versand", key: "versand" },
    { label: "30 Tage Rueckgabe", key: "rueckgabe" },
    { label: "Bestpreis-Garantie", key: "bestpreis" },
    { label: "Kombi-Versand immer moeglich", key: "kombi" },
  ];

  return (
    <section className="trust-row">
      {items.map((item) => <span key={item.key}>{item.label}</span>)}
    </section>
  );
}
