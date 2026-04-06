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
      <p>Eigener Kartenbereich mit deutscher Eingabe, Adressfeldern und Autofill-Unterstützung.</p>
      <div className="card-fields">
        <input className="admin-input" type="text" placeholder="Name auf der Karte" autoComplete="cc-name" disabled={!enabled || disabled} />
        <input className="admin-input" type="text" placeholder="Kartennummer" autoComplete="cc-number" disabled={!enabled || disabled} />
        <div className="card-fields-row">
          <input className="admin-input" type="text" placeholder="MM / JJ" autoComplete="cc-exp" disabled={!enabled || disabled} />
          <input className="admin-input" type="text" placeholder="CVC" autoComplete="cc-csc" disabled={!enabled || disabled} />
        </div>
        <input className="admin-input" type="text" placeholder="Rechnungsadresse" autoComplete="street-address" disabled={!enabled || disabled} />
      </div>
      {message ? <p className="payment-feedback">{message}</p> : null}
    </div>
  );
}
