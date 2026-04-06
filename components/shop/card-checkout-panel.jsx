"use client";

import { useEffect, useState } from "react";

export function CardCheckoutPanel({ disabled }) {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/card/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!active) return;
        setEnabled(Boolean(payload.enabled));
        setMessage(
          payload.enabled
            ? ""
            : "Kartenzahlung wird nach der Freischaltung separat aktiviert."
        );
      })
      .catch(() => {
        if (!active) return;
        setEnabled(false);
        setMessage("Kartenzahlung konnte gerade nicht geladen werden.");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="payment-card payment-card--card">
      <strong>Kredit- oder Debitkarte</strong>
      <p>Separater Kartenbereich unterhalb von PayPal.</p>
      {enabled ? (
        <div className="card-fields">
          <input className="admin-input" type="text" inputMode="text" placeholder="Name auf der Karte" autoComplete="cc-name" disabled={disabled} />
          <input className="admin-input" type="text" inputMode="numeric" placeholder="Kartennummer" autoComplete="cc-number" disabled={disabled} />
          <div className="card-fields-row">
            <input className="admin-input" type="text" inputMode="numeric" placeholder="MM / JJ" autoComplete="cc-exp" disabled={disabled} />
            <input className="admin-input" type="text" inputMode="numeric" placeholder="CVC" autoComplete="cc-csc" disabled={disabled} />
          </div>
          <input className="admin-input" type="text" placeholder="Rechnungsadresse" autoComplete="street-address" disabled={disabled} />
        </div>
      ) : null}
      {message ? <p className="payment-feedback">{message}</p> : null}
    </div>
  );
}
