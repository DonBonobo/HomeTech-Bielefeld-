export function TrustStrip() {
  const items = [
    { label: "Kostenloser Versand", key: "versand" },
    { label: "30 Tage Rückgabe", key: "rueckgabe" },
    { label: "7 Tage die Woche", key: "woche" },
    { label: "Kontakt & Hilfe", key: "hilfe" },
  ];

  return (
    <section className="trust-row">
      {items.map((item) => <span key={item.key}>{item.label}</span>)}
    </section>
  );
}
