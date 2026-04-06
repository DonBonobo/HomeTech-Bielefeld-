export default function AccountPage() {
  return (
    <div className="page-stack">
      <section className="section-block section-block--soft">
        <div className="section-header">
          <div>
            <p className="overline">Mein Konto</p>
            <h1>Anmelden oder Konto vorbereiten</h1>
            <p>Zum Launch bleibt der Einstieg bewusst einfach: Google oder E-Mail, danach Bestellungen und Adressen an einem Ort.</p>
          </div>
        </div>
        <div className="account-actions">
          <button type="button" className="primary-link">Mit Google fortfahren</button>
          <button type="button" className="secondary-link">Mit E-Mail anmelden</button>
        </div>
      </section>
      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="overline">Kontoansicht</p>
            <h2>Bestellungen, Adressen und Profil folgen in derselben ruhigen Struktur.</h2>
            <p>Der Einstieg bleibt klein und klar, damit die Launch-Version nicht mit halbfertigen Kontobereichen ueberladen wird.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
