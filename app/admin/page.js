import { shopConfig } from "@/lib/env";

export default function AdminPage() {
  const supabaseReady = Boolean(shopConfig.supabaseUrl && shopConfig.supabaseAnonKey);

  return (
    <div className="page-stack">
      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="overline">Admin</p>
            <h1>Mobiler Admin-Aufbau fuer die naechste Ausbaustufe</h1>
            <p>Der Remake-Pfad trennt Shop, Checkout und Admin sauber. Supabase ist weiterhin die vorgesehene Basis fuer Auth, Produkte und Bilder.</p>
          </div>
        </div>
        <article className="promo-card">
          <strong>{supabaseReady ? "Supabase ist konfiguriert" : "Supabase Demo-Modus"}</strong>
          <p>Naechster Schritt im Remake: modulare Produktverwaltung mit klaren Formularen statt monolithischer Event-Logik.</p>
        </article>
      </section>
    </div>
  );
}
