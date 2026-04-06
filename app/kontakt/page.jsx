"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { createLocalId, saveSupportMessage, listSupportMessages } from "@/lib/support-storage";

export default function KontaktPage() {
  const pathname = usePathname();
  const { user, ready } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const messages = useMemo(() => (user ? listSupportMessages(user.id) : []), [sent, user]);

  if (!ready) {
    return (
      <div className="page-stack">
        <section className="section-block section-block--soft support-page">
          <div className="section-header">
            <div>
              <p className="overline">Startseite / Kontakt</p>
              <h1>Nachrichten werden geladen</h1>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-stack">
        <section className="section-block section-block--soft support-page">
          <div className="section-header">
            <div>
              <p className="overline">Startseite / Kontakt</p>
              <h1>Bitte zuerst anmelden</h1>
              <p>So bleiben deine Nachricht und die Antwort an einem Ort.</p>
            </div>
            <Link href={`/konto?next=${encodeURIComponent(pathname)}`} className="secondary-link">Anmelden</Link>
          </div>
        </section>
      </div>
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    saveSupportMessage({
      id: createLocalId(),
      userId: user.id,
      email: user.email,
      subject: subject || "Allgemeine Frage",
      message,
      status: "Gesendet",
      createdAt: new Date().toISOString(),
    });
    setSubject("");
    setMessage("");
    setSent((current) => !current);
  }

  return (
    <div className="page-stack">
      <section className="section-block section-block--soft support-page">
        <div className="section-header">
          <div>
            <p className="overline">Startseite / Kontakt</p>
            <h1>Support</h1>
            <p>Schreibe uns direkt aus deinem Konto.</p>
          </div>
        </div>
        <form className="account-panel" onSubmit={handleSubmit}>
          <input className="admin-input" placeholder="Betreff" value={subject} onChange={(event) => setSubject(event.target.value)} />
          <textarea className="admin-input support-textarea" placeholder="Nachricht" value={message} onChange={(event) => setMessage(event.target.value)} required />
          <button type="submit" className="primary-link">Nachricht senden</button>
        </form>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="overline">Verlauf</p>
            <h2>Deine Nachrichten</h2>
          </div>
        </div>
        <div className="account-order-list">
          {messages.length ? messages.map((entry) => (
            <article key={entry.id} className="promo-card account-order-card">
              <strong>{entry.subject}</strong>
              <span>{entry.status}</span>
              <span>{new Date(entry.createdAt).toLocaleDateString("de-DE")}</span>
            </article>
          )) : (
            <article className="promo-card account-order-card">
              <strong>Noch keine Nachrichten</strong>
              <span>Hier erscheinen deine Anfragen.</span>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}
