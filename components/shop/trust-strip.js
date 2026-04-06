export function TrustStrip() {
  const items = [
    { label: "Schneller Versand", key: "versand" },
    { label: "30 Tage Rückgabe", key: "rueckgabe" },
    { label: "Bestpreis-Garantie", key: "bestpreis" },
    { label: "Kombi-Versand immer möglich", key: "kombi" },
  ];

  return (
    <section className="trust-row">
      {items.map((item) => <span key={item.key}>{item.label}</span>)}
    </section>
  );
}
