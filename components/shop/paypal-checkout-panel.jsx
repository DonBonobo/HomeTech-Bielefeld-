"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export function PayPalCheckoutPanel({ totalCents, disabled }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const captureStarted = useRef(false);

  useEffect(() => {
    let active = true;

    fetch("/api/paypal/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!active) return;
        setConfig(payload);
        setStatus(payload.enabled && payload.ordersEnabled ? "ready" : "disabled");
        setMessage(payload.enabled && payload.ordersEnabled ? "" : "PayPal ist noch nicht vollständig freigeschaltet.");
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
        setMessage("PayPal konnte gerade nicht geladen werden.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");
    const state = searchParams.get("paypal");
    if (!config?.enabled || !token || state !== "approved" || captureStarted.current) {
      return;
    }

    captureStarted.current = true;
    setStatus("capturing");
    setMessage("PayPal wird bestätigt.");

    fetch("/api/paypal/capture", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ orderId: token }),
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "paypal-order-capture-failed");
        }
        setStatus("approved");
        setMessage(`PayPal bestätigt${payload.payerName ? ` für ${payload.payerName}` : ""}.`);
        router.replace(pathname);
      })
      .catch(() => {
        setStatus("error");
        setMessage("PayPal konnte die Zahlung nicht bestätigen.");
      });
  }, [config?.enabled, pathname, router, searchParams, session?.access_token]);

  async function startPayPalRedirect() {
    setStatus("redirecting");
    setMessage("Weiter zu PayPal.");

    try {
      const origin = window.location.origin;
      const response = await fetch("/api/paypal/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          totalCents,
          returnUrl: `${origin}${pathname}?paypal=approved`,
          cancelUrl: `${origin}${pathname}?paypal=cancelled`,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.approveUrl) {
        throw new Error(payload.error || "paypal-order-create-failed");
      }
      window.location.assign(payload.approveUrl);
    } catch {
      setStatus("error");
      setMessage("PayPal konnte gerade nicht vorbereitet werden.");
    }
  }

  useEffect(() => {
    if (searchParams.get("paypal") !== "cancelled") {
      return;
    }
    setStatus("ready");
    setMessage("PayPal wurde abgebrochen.");
    router.replace(pathname);
  }, [pathname, router, searchParams]);

  return (
    <div className="payment-card payment-card--paypal" data-testid="paypal-panel">
      <div className="payment-card-head">
        <strong>PayPal</strong>
      </div>
      <p>
        {disabled
          ? "Lege zuerst Produkte in den Warenkorb."
          : "Mit PayPal-Konto oder PayPal-Guthaben bezahlen."}
      </p>
      <button
        type="button"
        className="paypal-redirect-button"
        data-testid="paypal-redirect-button"
        disabled={disabled || status === "loading" || status === "redirecting" || status === "capturing" || !config?.ordersEnabled}
        onClick={startPayPalRedirect}
      >
        {status === "redirecting" ? "PayPal öffnet" : status === "capturing" ? "PayPal wird bestätigt" : "Mit PayPal bezahlen"}
      </button>
      <p className="payment-helper">Weiterleitung zu PayPal und danach zurück zum Shop.</p>
      {status === "approved" || status === "error" || status === "disabled" || searchParams.get("paypal") === "cancelled" ? (
        <p className="payment-feedback">{message}</p>
      ) : null}
    </div>
  );
}
