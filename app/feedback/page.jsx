"use client";

import { useState } from "react";
import { createLocalId, saveFeedbackEntry } from "@/lib/support-storage";

export default function FeedbackPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    saveFeedbackEntry({
      id: createLocalId(),
      email: email || null,
      message,
      status: "Neu",
      createdAt: new Date().toISOString(),
    });
    setEmail("");
    setMessage("");
    setSent(true);
  }

  return (
    <div className="page-stack">
      <section className="section-block section-block--soft">
        <div className="section-header">
          <div>
            <p className="overline">Feedback</p>
            <h1>Rückmeldung senden</h1>
            <p>Anonym oder mit E-Mail-Adresse.</p>
          </div>
        </div>
        <form className="account-panel" onSubmit={handleSubmit}>
          <input className="admin-input" type="email" placeholder="E-Mail-Adresse optional" value={email} onChange={(event) => setEmail(event.target.value)} />
          <textarea className="admin-input support-textarea" placeholder="Dein Feedback" value={message} onChange={(event) => setMessage(event.target.value)} required />
          <button type="submit" className="primary-link">Feedback senden</button>
        </form>
        {sent ? <p className="account-feedback">Danke für dein Feedback.</p> : null}
      </section>
    </div>
  );
}
