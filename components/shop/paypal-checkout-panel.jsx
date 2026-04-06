"use client";

import { useEffect, useRef, useState } from "react";

function loadPayPalSdk({ clientId, currency, intent }) {
  if (!clientId) {
    return Promise.reject(new Error("missing-client-id"));
  }

  if (window.paypal) {
    return Promise.resolve(window.paypal);
  }

  const existing = document.querySelector("script[data-paypal-sdk='true']");
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(window.paypal), { once: true });
      existing.addEventListener("error", () => reject(new Error("paypal-sdk-load-failed")), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=${encodeURIComponent(intent)}&components=buttons`;
    script.async = true;
    script.dataset.paypalSdk = "true";
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error("paypal-sdk-load-failed"));
    document.head.appendChild(script);
  });
}

export function PayPalCheckoutPanel({ totalCents, disabled }) {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const buttonRef = useRef(null);

  useEffect(() => {
    let active = true;

    fetch("/api/paypal/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!active) return;
        setConfig(payload);
        setStatus(payload.enabled && payload.ordersEnabled ? "ready" : "disabled");
        setMessage(payload.enabled && payload.ordersEnabled ? "" : "PayPal ist noch nicht vollständig konfiguriert.");
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
    if (!config?.enabled || disabled || !buttonRef.current) {
      return;
    }

    let cancelled = false;
    buttonRef.current.innerHTML = "";

    loadPayPalSdk(config)
      .then((paypal) => {
        if (cancelled || !paypal?.Buttons) return;

        return paypal.Buttons({
          style: {
            layout: "vertical",
            shape: "rect",
            label: "paypal",
            color: "gold",
          },
          createOrder: async () => {
            const response = await fetch("/api/paypal/order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ totalCents }),
            });
            const payload = await response.json();
            if (!response.ok || !payload.id) {
              throw new Error(payload.error || "paypal-order-create-failed");
            }
            return payload.id;
          },
          onApprove: async (data) => {
            const response = await fetch("/api/paypal/capture", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID }),
            });
            const details = await response.json();
            if (!response.ok) {
              throw new Error(details.error || "paypal-order-capture-failed");
            }
            setStatus("approved");
            setMessage(`PayPal bestätigt. Bestellung für ${details.payerName || "deinen Einkauf"} freigegeben.`);
          },
          onError: () => {
            setStatus("error");
            setMessage("PayPal konnte die Zahlung gerade nicht vorbereiten.");
          },
        }).render(buttonRef.current);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setMessage("PayPal SDK konnte nicht geladen werden.");
      });

    return () => {
      cancelled = true;
      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
      }
    };
  }, [config, disabled, totalCents]);

  return (
    <div className="payment-card">
      <strong>PayPal</strong>
      <p>
        {disabled
          ? "Lege zuerst Produkte in den Warenkorb."
          : "Direkt mit deinem PayPal-Konto oder PayPal-Guthaben bezahlen."}
      </p>
      <div ref={buttonRef} className="paypal-button-host" />
      {status === "approved" || status === "error" || status === "disabled" ? (
        <p className="payment-feedback">{message}</p>
      ) : null}
    </div>
  );
}
