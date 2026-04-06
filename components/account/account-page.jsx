"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sanitizeNextPath, shouldRedirectAfterAuth } from "@/lib/auth";
import { useAuth } from "@/components/providers/auth-provider";

export function AccountPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get("next"), "/konto");
  const { user, ready, signInWithGoogle, signInWithEmail, exchangeCodeForSession, getPendingRedirect, clearPendingRedirect, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const hasCode = searchParams.get("code");
    if (!hasCode) {
      return undefined;
    }

    setBusy(true);
    exchangeCodeForSession(window.location.href).then(({ error }) => {
      if (!active) return;
      setBusy(false);
      if (error) {
        setMessage("Die Anmeldung konnte nicht abgeschlossen werden.");
        return;
      }
      const redirectTarget = sanitizeNextPath(searchParams.get("next") || getPendingRedirect(), "/konto");
      clearPendingRedirect();
      router.replace(redirectTarget);
    });

    return () => {
      active = false;
    };
  }, [clearPendingRedirect, exchangeCodeForSession, getPendingRedirect, router, searchParams]);

  useEffect(() => {
    if (!ready || !user || !shouldRedirectAfterAuth(nextPath)) {
      return;
    }
    router.replace(nextPath);
  }, [nextPath, ready, router, user]);

  async function handleGoogle() {
    setBusy(true);
    const { error } = await signInWithGoogle(nextPath);
    if (error) {
      setMessage("Google-Anmeldung konnte nicht gestartet werden.");
      setBusy(false);
    }
  }

  async function handleEmail(event) {
    event.preventDefault();
    setBusy(true);
    const { error } = await signInWithEmail(email, nextPath);
    setBusy(false);
    if (error) {
      setMessage("E-Mail-Anmeldung konnte nicht gestartet werden.");
      return;
    }
    setMessage("Wir haben dir einen Magic Link per E-Mail geschickt.");
  }

  if (ready && user) {
    return (
      <div className="page-stack">
        <section className="section-block section-block--soft">
          <div className="section-header">
            <div>
              <p className="overline">Mein Konto</p>
              <h1>Willkommen zurück</h1>
              <p>{user.email}</p>
            </div>
            <button type="button" className="secondary-link" onClick={() => signOut()}>
              Abmelden
            </button>
          </div>
        </section>
        <section className="section-block">
          <div className="section-header">
            <div>
              <p className="overline">Kontoansicht</p>
              <h2>Bestellungen, Adressen und Profil bleiben an einem Ort.</h2>
              <p>Dein Warenkorb wurde mit dem Konto verbunden und bleibt auf diesem Gerät erhalten.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="section-block section-block--soft">
        <div className="section-header">
          <div>
            <p className="overline">Mein Konto</p>
            <h1>Anmelden oder registrieren</h1>
            <p>Google oder E-Mail, ohne Umweg. Danach landest du wieder genau dort, wo du vorher warst.</p>
          </div>
        </div>
        <div className="account-actions">
          <button type="button" className="primary-link" disabled={busy} onClick={handleGoogle}>
            Mit Google fortfahren
          </button>
          <form className="account-email-form" onSubmit={handleEmail}>
            <input
              className="admin-input"
              type="email"
              required
              placeholder="E-Mail-Adresse"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button type="submit" className="secondary-link" disabled={busy}>
              Mit E-Mail anmelden
            </button>
          </form>
        </div>
        {message ? <p className="account-feedback">{message}</p> : null}
      </section>
    </div>
  );
}
