"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sanitizeNextPath, shouldRedirectAfterAuth } from "@/lib/auth";
import { useAuth } from "@/components/providers/auth-provider";

function translateAuthError(error) {
  const message = error?.message || "";
  if (message.includes("Unsupported provider")) {
    return "Google ist noch nicht freigeschaltet.";
  }
  if (message.includes("Invalid login credentials")) {
    return "E-Mail oder Passwort stimmen nicht.";
  }
  if (message.includes("Email not confirmed")) {
    return "Bitte bestätige zuerst deine E-Mail-Adresse.";
  }
  if (message.includes("Password should be at least")) {
    return "Bitte verwende ein stärkeres Passwort.";
  }
  if (message.includes("User already registered")) {
    return "Für diese E-Mail gibt es bereits ein Konto.";
  }
  return "Das hat gerade nicht geklappt. Bitte versuche es noch einmal.";
}

export function AccountPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get("next"), "/konto");
  const mode = searchParams.get("mode");
  const {
    user,
    profile,
    role,
    isAdmin,
    ready,
    authEvent,
    signInWithGoogle,
    signInWithPassword,
    signUpWithEmail,
    requestPasswordReset,
    updatePassword,
    exchangeCodeForSession,
    getPendingRedirect,
    clearPendingRedirect,
    signOut,
  } = useAuth();

  const [view, setView] = useState("anmelden");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const isRecoveryMode = mode === "passwort" || authEvent === "PASSWORD_RECOVERY";

  useEffect(() => {
    if (mode === "registrieren") {
      setView("registrieren");
    } else if (mode === "zuruecksetzen" || mode === "passwort") {
      setView("zuruecksetzen");
    } else {
      setView("anmelden");
    }
  }, [mode]);

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
      if (mode === "bestaetigen") {
        setMessage("Deine E-Mail-Adresse wurde bestätigt.");
      }
      const redirectTarget = sanitizeNextPath(searchParams.get("next") || getPendingRedirect(), "/konto");
      clearPendingRedirect();
      router.replace(redirectTarget);
    });

    return () => {
      active = false;
    };
  }, [clearPendingRedirect, exchangeCodeForSession, getPendingRedirect, mode, router, searchParams]);

  useEffect(() => {
    if (!ready || !user || !shouldRedirectAfterAuth(nextPath) || isRecoveryMode) {
      return;
    }
    router.replace(nextPath);
  }, [isRecoveryMode, nextPath, ready, router, user]);

  const title = useMemo(() => {
    if (isRecoveryMode) return "Neues Passwort festlegen";
    if (view === "registrieren") return "Konto erstellen";
    if (view === "zuruecksetzen") return "Passwort zurücksetzen";
    return "Anmelden";
  }, [isRecoveryMode, view]);

  async function handleGoogle() {
    setBusy(true);
    setMessage("");
    const { error } = await signInWithGoogle(nextPath);
    if (error) {
      setMessage(translateAuthError(error));
      setBusy(false);
    }
  }

  async function handleEmailSignIn(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const { error } = await signInWithPassword(email, password, nextPath);
    setBusy(false);
    if (error) {
      setMessage(translateAuthError(error));
      return;
    }
    router.replace(nextPath);
  }

  async function handleEmailSignUp(event) {
    event.preventDefault();
    if (password !== passwordRepeat) {
      setMessage("Bitte wiederhole dein Passwort identisch.");
      return;
    }
    setBusy(true);
    setMessage("");
    const { error } = await signUpWithEmail(email, password, nextPath);
    setBusy(false);
    if (error) {
      setMessage(translateAuthError(error));
      return;
    }
    setMessage("Bitte bestätige jetzt deine E-Mail-Adresse. Danach kannst du dich direkt anmelden.");
    setView("anmelden");
  }

  async function handlePasswordResetRequest(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const { error } = await requestPasswordReset(email, nextPath);
    setBusy(false);
    if (error) {
      setMessage(translateAuthError(error));
      return;
    }
    setMessage("Wir haben dir eine E-Mail zum Zurücksetzen geschickt.");
  }

  async function handlePasswordUpdate(event) {
    event.preventDefault();
    if (password !== passwordRepeat) {
      setMessage("Bitte wiederhole dein Passwort identisch.");
      return;
    }
    setBusy(true);
    setMessage("");
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) {
      setMessage(translateAuthError(error));
      return;
    }
    setMessage("Dein Passwort wurde gespeichert.");
    const redirectTarget = sanitizeNextPath(getPendingRedirect(), "/konto");
    clearPendingRedirect();
    router.replace(redirectTarget);
  }

  if (ready && user && !isRecoveryMode) {
    return (
      <div className="page-stack">
        <section className="section-block section-block--soft">
          <div className="section-header">
            <div>
              <p className="overline">Mein Konto</p>
              <h1>Willkommen zurück</h1>
              <p>{profile?.full_name || user.email}</p>
            </div>
            <div className="account-top-actions">
              {isAdmin ? <Link href="/admin" className="secondary-link">Admin</Link> : null}
              <button type="button" className="secondary-link" onClick={() => signOut()}>
                Abmelden
              </button>
            </div>
          </div>
        </section>
        <section className="section-block">
          <div className="section-header">
            <div>
              <p className="overline">Konto</p>
              <h2>Alles an einem Ort</h2>
              <p>Bestellungen, Adressen und dein Warenkorb bleiben mit deinem Konto verbunden.</p>
            </div>
          </div>
          <div className="account-overview-grid">
            <article className="promo-card">
              <strong>Adresse & Kontakt</strong>
              <p>{user.email}</p>
            </article>
            <article className="promo-card">
              <strong>Status</strong>
              <p>{role === "admin" ? "Administrator" : "Kunde"}</p>
            </article>
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
            <h1>{title}</h1>
            <p>Mit Google oder E-Mail. Danach landest du wieder genau dort, wo du vorher warst.</p>
          </div>
        </div>

        <div className="account-panel">
          {!isRecoveryMode ? (
            <>
              <div className="account-tabs" role="tablist" aria-label="Kontozugang">
                <button type="button" className={view === "anmelden" ? "is-active" : ""} onClick={() => setView("anmelden")}>Anmelden</button>
                <button type="button" className={view === "registrieren" ? "is-active" : ""} onClick={() => setView("registrieren")}>Konto erstellen</button>
                <button type="button" className={view === "zuruecksetzen" ? "is-active" : ""} onClick={() => setView("zuruecksetzen")}>Passwort vergessen?</button>
              </div>

              <button type="button" className="primary-link" disabled={busy} onClick={handleGoogle}>
                Mit Google fortfahren
              </button>

              {view === "anmelden" ? (
                <form className="account-email-form" onSubmit={handleEmailSignIn}>
                  <input
                    className="admin-input"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="E-Mail-Adresse"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <input
                    className="admin-input"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Passwort"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button type="submit" className="secondary-link" disabled={busy}>
                    Mit E-Mail anmelden
                  </button>
                </form>
              ) : null}

              {view === "registrieren" ? (
                <form className="account-email-form" onSubmit={handleEmailSignUp}>
                  <input
                    className="admin-input"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="E-Mail-Adresse"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <input
                    className="admin-input"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Passwort festlegen"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <input
                    className="admin-input"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Passwort wiederholen"
                    value={passwordRepeat}
                    onChange={(event) => setPasswordRepeat(event.target.value)}
                  />
                  <button type="submit" className="secondary-link" disabled={busy}>
                    Konto erstellen
                  </button>
                </form>
              ) : null}

              {view === "zuruecksetzen" ? (
                <form className="account-email-form" onSubmit={handlePasswordResetRequest}>
                  <input
                    className="admin-input"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="E-Mail-Adresse"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <button type="submit" className="secondary-link" disabled={busy}>
                    Link zum Zurücksetzen senden
                  </button>
                </form>
              ) : null}
            </>
          ) : (
            <form className="account-email-form" onSubmit={handlePasswordUpdate}>
              <input
                className="admin-input"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Neues Passwort"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <input
                className="admin-input"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Neues Passwort wiederholen"
                value={passwordRepeat}
                onChange={(event) => setPasswordRepeat(event.target.value)}
              />
              <button type="submit" className="secondary-link" disabled={busy}>
                Passwort speichern
              </button>
            </form>
          )}
        </div>

        {message ? <p className="account-feedback">{message}</p> : null}
      </section>
    </div>
  );
}
