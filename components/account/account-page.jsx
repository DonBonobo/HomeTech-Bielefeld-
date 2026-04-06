"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sanitizeNextPath, shouldRedirectAfterAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/commerce";
import { useAuth } from "@/components/providers/auth-provider";
import { getVisualPreview } from "@/lib/visual-preview";

function translateAuthError(error) {
  const message = error?.message || "";
  if (message.includes("Unsupported provider")) return "Google ist noch nicht freigeschaltet.";
  if (message.includes("Invalid login credentials")) return "E-Mail oder Passwort stimmen nicht.";
  if (message.includes("Email not confirmed")) return "Bitte bestätige zuerst deine E-Mail-Adresse.";
  if (message.includes("Password should be at least")) return "Bitte verwende ein stärkeres Passwort.";
  if (message.includes("User already registered")) return "Für diese E-Mail gibt es bereits ein Konto.";
  return "Das hat gerade nicht geklappt. Bitte versuche es noch einmal.";
}

function formatOrderStatus(status) {
  if (status === "captured") return "Bezahlt";
  if (status === "pending") return "Offen";
  if (status === "cancelled") return "Storniert";
  return status || "Offen";
}

export function AccountPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasCode = searchParams.get("code");
  const nextPath = sanitizeNextPath(searchParams.get("next"), "/konto");
  const mode = searchParams.get("mode");
  const {
    user,
    profile,
    role,
    isAdmin,
    ready,
    authEvent,
    supabase,
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
  const [orders, setOrders] = useState([]);
  const [ordersReady, setOrdersReady] = useState(false);

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

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      if (!ready) return;
      if (!user || !supabase) {
        const preview = getVisualPreview();
        setOrders(preview?.orders || []);
        setOrdersReady(true);
        return;
      }

      const preview = getVisualPreview();
      if (preview?.orders) {
        setOrders(preview.orders);
        setOrdersReady(true);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total_cents, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!active) return;
      setOrders(error ? [] : (data || []));
      setOrdersReady(true);
    }

    setOrdersReady(false);
    loadOrders();
    return () => {
      active = false;
    };
  }, [ready, supabase, user]);

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
    setMessage("Bitte bestätige jetzt deine E-Mail-Adresse.");
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
    const redirectTarget = sanitizeNextPath(getPendingRedirect(), "/konto");
    clearPendingRedirect();
    router.replace(redirectTarget);
  }

  if (!ready || hasCode) {
    return (
      <div className="page-stack">
        <section className="section-block section-block--soft auth-loading-card">
          <div className="section-header">
            <div>
              <p className="overline">Mein Konto</p>
              <h1>{hasCode ? "Anmeldung wird abgeschlossen" : "Sitzung wird geprüft"}</h1>
            </div>
          </div>
          <div className="auth-loading-indicator" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </section>
      </div>
    );
  }

  if (user && !isRecoveryMode) {
    return (
      <div className="page-stack">
        <section className="section-block section-block--soft account-shell" data-testid="account-shell">
          <div className="account-identity">
            <div>
              <p className="overline">Mein Konto</p>
              <h1>Letzte Bestellungen</h1>
              <p>{profile?.full_name || user.email}</p>
            </div>
            <div className="account-status-pill">{role === "admin" ? "Admin" : "Aktiv"}</div>
          </div>

          <div className="account-order-list">
            {!ordersReady ? (
              <article className="account-order-card account-order-card--muted">
                <div>
                  <strong>Bestellungen werden geladen</strong>
                </div>
              </article>
            ) : orders.length ? (
              orders.map((order) => (
                <article key={order.id} className="account-order-card">
                  <div className="account-order-copy">
                    <strong>Bestellung {order.id.slice(0, 8).toUpperCase()}</strong>
                    <span>{new Date(order.created_at).toLocaleDateString("de-DE")}</span>
                  </div>
                  <div className="account-order-meta">
                    <span className="account-order-badge">{formatOrderStatus(order.status)}</span>
                    <strong>{formatCurrency(order.total_cents || 0)}</strong>
                  </div>
                </article>
              ))
            ) : (
              <article className="account-order-card account-order-card--empty">
                <div>
                  <strong>Noch keine Bestellungen</strong>
                  <span>Ihre letzten Bestellungen erscheinen hier.</span>
                </div>
              </article>
            )}
          </div>
        </section>

        <section className="section-block account-shell">
          <div className="account-detail-grid">
            <article className="account-detail-card">
              <span>Kontakt</span>
              <strong>{user.email}</strong>
            </article>
            <article className="account-detail-card">
              <span>Adresse</span>
              <strong>{profile?.address_line_1 || "Noch nicht hinterlegt"}</strong>
            </article>
          </div>
          <div className="account-top-actions account-top-actions--stacked">
            {isAdmin ? <Link href="/admin" className="secondary-link">Zum Admin</Link> : null}
            <button type="button" className="secondary-link" onClick={() => signOut()}>
              Abmelden
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="section-block section-block--soft auth-shell">
          <div className="section-header">
            <div>
              <p className="overline">Mein Konto</p>
              <h1>{title}</h1>
              <p>Nach der Anmeldung geht es direkt weiter.</p>
            </div>
          </div>

        <div className="account-panel">
          {!isRecoveryMode ? (
            <>
              <div className="account-tabs" role="tablist" aria-label="Kontozugang">
                <button type="button" className={view === "anmelden" ? "is-active" : ""} onClick={() => setView("anmelden")}>Anmelden</button>
                <button type="button" className={view === "registrieren" ? "is-active" : ""} onClick={() => setView("registrieren")}>Registrieren</button>
                <button type="button" className={view === "zuruecksetzen" ? "is-active" : ""} onClick={() => setView("zuruecksetzen")}>Passwort vergessen</button>
              </div>

              <button type="button" className="primary-link" disabled={busy} onClick={handleGoogle}>
                Mit Google fortfahren
              </button>

              {view === "anmelden" ? (
                <form className="account-email-form" onSubmit={handleEmailSignIn}>
                  <input className="admin-input" type="email" required autoComplete="email" placeholder="E-Mail-Adresse" value={email} onChange={(event) => setEmail(event.target.value)} />
                  <input className="admin-input" type="password" required autoComplete="current-password" placeholder="Passwort" value={password} onChange={(event) => setPassword(event.target.value)} />
                  <button type="submit" className="secondary-link" disabled={busy}>Anmelden</button>
                </form>
              ) : null}

              {view === "registrieren" ? (
                <form className="account-email-form" onSubmit={handleEmailSignUp}>
                  <input className="admin-input" type="email" required autoComplete="email" placeholder="E-Mail-Adresse" value={email} onChange={(event) => setEmail(event.target.value)} />
                  <input className="admin-input" type="password" required minLength={8} autoComplete="new-password" placeholder="Passwort festlegen" value={password} onChange={(event) => setPassword(event.target.value)} />
                  <input className="admin-input" type="password" required minLength={8} autoComplete="new-password" placeholder="Passwort wiederholen" value={passwordRepeat} onChange={(event) => setPasswordRepeat(event.target.value)} />
                  <button type="submit" className="secondary-link" disabled={busy}>Registrieren</button>
                </form>
              ) : null}

              {view === "zuruecksetzen" ? (
                <form className="account-email-form" onSubmit={handlePasswordResetRequest}>
                  <input className="admin-input" type="email" required autoComplete="email" placeholder="E-Mail-Adresse" value={email} onChange={(event) => setEmail(event.target.value)} />
                  <button type="submit" className="secondary-link" disabled={busy}>Link zum Zurücksetzen senden</button>
                </form>
              ) : null}
            </>
          ) : (
            <form className="account-email-form" onSubmit={handlePasswordUpdate}>
              <input className="admin-input" type="password" required minLength={8} autoComplete="new-password" placeholder="Neues Passwort" value={password} onChange={(event) => setPassword(event.target.value)} />
              <input className="admin-input" type="password" required minLength={8} autoComplete="new-password" placeholder="Neues Passwort wiederholen" value={passwordRepeat} onChange={(event) => setPasswordRepeat(event.target.value)} />
              <button type="submit" className="secondary-link" disabled={busy}>Passwort speichern</button>
            </form>
          )}
        </div>

        {message ? <p className="account-feedback">{message}</p> : null}
      </section>
    </div>
  );
}
