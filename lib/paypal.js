import { shopConfig } from "@/lib/env";

export function getPayPalEnvironment() {
  return process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
}

function getPayPalApiBase() {
  return getPayPalEnvironment() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getPayPalAccessToken() {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new Error("paypal-env-missing");
  }

  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`paypal-token-${response.status}`);
  }

  const payload = await response.json();
  return payload.access_token;
}

function getPayPalExperienceContext({ returnUrl, cancelUrl }) {
  if (!returnUrl || !cancelUrl) {
    return undefined;
  }

  return {
    payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
    user_action: "PAY_NOW",
    landing_page: "LOGIN",
    return_url: returnUrl,
    cancel_url: cancelUrl,
  };
}

export async function createPayPalOrder(totalCents, options = {}) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      payment_source: {
        paypal: {
          experience_context: getPayPalExperienceContext(options),
        },
      },
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: (totalCents / 100).toFixed(2),
          },
          description: `${shopConfig.businessName} Bestellung`,
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`paypal-order-${response.status}`);
  }

  return response.json();
}

export async function capturePayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`paypal-capture-${response.status}`);
  }

  return response.json();
}
