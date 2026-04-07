"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/components/checkout/paypal-checkout-panel.module.css";
import type { CheckoutCustomer, PayPalClientConfig } from "@/lib/checkout-types";
import { formatEuro } from "@/lib/format";

type CheckoutLineItem = {
  productId: string;
  quantity: number;
};

type PayPalCheckoutPanelProps = {
  config: PayPalClientConfig;
  customer: CheckoutCustomer;
  items: CheckoutLineItem[];
  totalCents: number;
  disabled: boolean;
  onPaid: (orderId: string) => void | Promise<void>;
  onCancelled: (orderId?: string) => void | Promise<void>;
  onFailed: (orderId?: string, message?: string) => void | Promise<void>;
};

type PayPalButtonsInstance = {
  render: (container: HTMLElement) => Promise<void>;
  close?: () => void;
  isEligible?: () => boolean;
};

type PayPalButtonsFactory = {
  Buttons: (options: Record<string, unknown>) => PayPalButtonsInstance;
};

declare global {
  interface Window {
    paypal?: PayPalButtonsFactory;
  }
}

let sdkPromise: Promise<PayPalButtonsFactory> | null = null;

function loadPayPalSdk(config: PayPalClientConfig) {
  if (!config.clientId) {
    return Promise.reject(new Error("PayPal Client ID fehlt."));
  }

  if (window.paypal?.Buttons) {
    return Promise.resolve(window.paypal);
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(config.clientId)}&currency=${encodeURIComponent(config.currency)}&intent=${encodeURIComponent(config.intent)}&components=buttons`;
    script.async = true;
    script.dataset.paypalSdk = "true";
    script.onload = () => {
      if (window.paypal?.Buttons) {
        resolve(window.paypal);
        return;
      }
      reject(new Error("PayPal SDK ist geladen, aber Buttons fehlen."));
    };
    script.onerror = () => reject(new Error("PayPal SDK konnte nicht geladen werden."));
    document.head.appendChild(script);
  });

  return sdkPromise;
}

async function postJson<TResponse>(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = (await response.json()) as TResponse & { ok?: boolean; error?: string };

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error ?? "PayPal Checkout konnte nicht verarbeitet werden.");
  }

  return payload;
}

export function PayPalCheckoutPanel({
  config,
  customer,
  items,
  totalCents,
  disabled,
  onPaid,
  onCancelled,
  onFailed
}: PayPalCheckoutPanelProps) {
  const buttonHostRef = useRef<HTMLDivElement | null>(null);
  const customerRef = useRef(customer);
  const itemsRef = useRef(items);
  const currentOrderIdRef = useRef<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [hasError, setHasError] = useState(false);

  customerRef.current = customer;
  itemsRef.current = items;

  const disabledMessage = !items.length
    ? "Lege zuerst Produkte in den Warenkorb."
    : disabled
      ? "Bitte Lieferdaten vollständig ausfüllen, dann erscheint der PayPal Checkout."
      : !config.enabled
        ? "PayPal ist noch nicht vollständig konfiguriert."
        : "";

  useEffect(() => {
    if (!buttonHostRef.current) return;

    if (disabled || !config.enabled) {
      buttonHostRef.current.innerHTML = "";
      return;
    }

    let isCancelled = false;
    let instance: PayPalButtonsInstance | null = null;
    buttonHostRef.current.innerHTML = "";
    setFeedback("");
    setHasError(false);

    loadPayPalSdk(config)
      .then((paypal) => {
        if (isCancelled || !buttonHostRef.current) return;

        instance = paypal.Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            tagline: false
          },
          createOrder: async () => {
            setFeedback("PayPal Bestellung wird vorbereitet ...");
            setHasError(false);

            const payload = await postJson<{
              internalOrderId: string;
              paypalOrderId: string;
            }>("/api/paypal/orders", {
              customer: customerRef.current,
              items: itemsRef.current
            });

            currentOrderIdRef.current = payload.internalOrderId;
            setFeedback("PayPal Checkout bereit. Bitte im PayPal Fenster bestätigen.");

            return payload.paypalOrderId;
          },
          onApprove: async (data: { orderID?: string }) => {
            const currentOrderId = currentOrderIdRef.current;
            if (!currentOrderId) {
              throw new Error("Interne Bestellnummer fehlt.");
            }

            setFeedback("Zahlung wird bestätigt ...");
            setHasError(false);

            const payload = await postJson<{ orderId: string }>(
              `/api/paypal/orders/${currentOrderId}/capture`,
              {
                paypalOrderId: data.orderID
              }
            );

            await onPaid(payload.orderId);
          },
          onCancel: async () => {
            const currentOrderId = currentOrderIdRef.current;
            if (currentOrderId) {
              try {
                await postJson(`/api/paypal/orders/${currentOrderId}/cancel`, {});
              } catch {}
            }
            await onCancelled(currentOrderId ?? undefined);
          },
          onError: async (error: unknown) => {
            const message =
              error instanceof Error
                ? error.message
                : "PayPal Checkout konnte nicht geladen werden.";
            const currentOrderId = currentOrderIdRef.current;

            setFeedback(message);
            setHasError(true);

            if (currentOrderId) {
              try {
                await postJson(`/api/paypal/orders/${currentOrderId}/failure`, {
                  reason: message
                });
              } catch {}
            }

            await onFailed(currentOrderId ?? undefined, message);
          }
        });

        return instance.render(buttonHostRef.current);
      })
      .catch(async (error: unknown) => {
        if (isCancelled) return;

        const message =
          error instanceof Error
            ? error.message
            : "PayPal SDK konnte nicht geladen werden.";

        setFeedback(message);
        setHasError(true);
        await onFailed(currentOrderIdRef.current ?? undefined, message);
      });

    return () => {
      isCancelled = true;
      instance?.close?.();
      if (buttonHostRef.current) {
        buttonHostRef.current.innerHTML = "";
      }
    };
  }, [config, disabled, onCancelled, onFailed, onPaid]);

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>PayPal</p>
        <h2 className={styles.title}>Direkt bezahlen</h2>
        <p className={styles.body}>
          Betrag und Positionen werden serverseitig aus dem echten Produktbestand berechnet. Als
          bezahlt gilt dein Einkauf erst nach erfolgreichem Capture.
        </p>
      </div>

      <div className={styles.totals}>
        <span>PayPal Gesamt</span>
        <strong>{formatEuro(totalCents)}</strong>
      </div>

      {disabledMessage ? <p className={styles.hint}>{disabledMessage}</p> : null}
      <div ref={buttonHostRef} className={styles.buttonHost} />
      {feedback ? (
        <p className={`${styles.feedback} ${hasError ? styles.feedbackError : ""}`.trim()}>
          {feedback}
        </p>
      ) : null}
    </section>
  );
}
