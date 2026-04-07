import type { OrderSnapshotItem, PayPalClientConfig } from "@/lib/checkout-types";

type PayPalAccessTokenResponse = {
  access_token: string;
};

type PayPalCreateOrderResponse = {
  id: string;
  status: string;
  purchase_units?: Array<{
    custom_id?: string;
    amount?: {
      currency_code?: string;
      value?: string;
    };
  }>;
};

type PayPalCaptureResponse = {
  id: string;
  status: string;
  purchase_units?: Array<{
    custom_id?: string;
    amount?: {
      currency_code?: string;
      value?: string;
    };
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
        create_time?: string;
        amount?: {
          currency_code?: string;
          value?: string;
        };
      }>;
    };
  }>;
  payer?: {
    name?: {
      given_name?: string;
      surname?: string;
    };
    email_address?: string;
  };
};

export class PayPalError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "PayPalError";
    this.status = status;
  }
}

function formatAmount(cents: number) {
  return (cents / 100).toFixed(2);
}

function getPayPalEnvironment(): "sandbox" | "live" {
  return process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
}

function getPayPalApiBase() {
  return getPayPalEnvironment() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function getPayPalClientConfig(): PayPalClientConfig {
  const clientId = process.env.PAYPAL_CLIENT_ID ?? "";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? "";

  return {
    enabled: Boolean(clientId && clientSecret),
    clientId: clientId && clientSecret ? clientId : "",
    currency: "EUR",
    intent: "capture",
    environment: getPayPalEnvironment()
  };
}

function assertPayPalConfigured() {
  const config = getPayPalClientConfig();

  if (!config.enabled || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new PayPalError("PayPal ist noch nicht vollständig konfiguriert.", 503);
  }

  return config;
}

async function getPayPalAccessToken() {
  const config = assertPayPalConfigured();
  const auth = Buffer.from(
    `${config.clientId}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new PayPalError("PayPal Zugangstoken konnte nicht geladen werden.", response.status);
  }

  const payload = (await response.json()) as PayPalAccessTokenResponse;
  return payload.access_token;
}

async function parsePayPalError(response: Response) {
  try {
    const payload = (await response.json()) as {
      message?: string;
      details?: Array<{ description?: string }>;
    };
    return payload.details?.[0]?.description ?? payload.message ?? `PayPal ${response.status}`;
  } catch {
    return `PayPal ${response.status}`;
  }
}

export async function createPayPalOrder(input: {
  internalOrderId: string;
  totalCents: number;
  items: OrderSnapshotItem[];
}) {
  const config = assertPayPalConfigured();
  const accessToken = await getPayPalAccessToken();
  const amount = formatAmount(input.totalCents);

  const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `hometech-create-${input.internalOrderId}`
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "HomeTech Bielefeld",
            locale: "de-DE",
            landing_page: "LOGIN",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW"
          }
        }
      },
      purchase_units: [
        {
          custom_id: input.internalOrderId,
          invoice_id: input.internalOrderId,
          description: "HomeTech Bielefeld Einkauf",
          amount: {
            currency_code: config.currency,
            value: amount,
            breakdown: {
              item_total: {
                currency_code: config.currency,
                value: amount
              }
            }
          },
          items: input.items.map((item) => ({
            name: item.title,
            description: item.spec,
            quantity: String(item.quantity),
            unit_amount: {
              currency_code: config.currency,
              value: formatAmount(item.unitPriceCents)
            }
          }))
        }
      ]
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new PayPalError(await parsePayPalError(response), response.status);
  }

  return (await response.json()) as PayPalCreateOrderResponse;
}

export async function capturePayPalOrder(input: {
  internalOrderId: string;
  paypalOrderId: string;
}) {
  await assertPayPalConfigured();
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${getPayPalApiBase()}/v2/checkout/orders/${input.paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `hometech-capture-${input.internalOrderId}`
      },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new PayPalError(await parsePayPalError(response), response.status);
  }

  return (await response.json()) as PayPalCaptureResponse;
}

export function validateCapturedAmount(
  totalCents: number,
  internalOrderId: string,
  capture: PayPalCaptureResponse
) {
  const purchaseUnit = capture.purchase_units?.[0];
  const completedCapture = purchaseUnit?.payments?.captures?.[0];
  const amount = completedCapture?.amount ?? purchaseUnit?.amount;

  if (purchaseUnit?.custom_id !== internalOrderId) {
    throw new PayPalError("PayPal Bestellung gehört nicht zu diesem Warenkorb.", 409);
  }

  if (capture.status !== "COMPLETED" || completedCapture?.status !== "COMPLETED") {
    throw new PayPalError("PayPal Zahlung wurde noch nicht abgeschlossen.", 409);
  }

  if (amount?.currency_code !== "EUR" || amount.value !== formatAmount(totalCents)) {
    throw new PayPalError("PayPal Betrag stimmt nicht mit dem Warenkorb überein.", 409);
  }

  return completedCapture;
}
