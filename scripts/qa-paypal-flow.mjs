import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const envPath = "/root/HomeTech-Bielefeld/.env.local";
const screenshotPath = "/root/HomeTech-Bielefeld/artifacts/paypal-checkout-button.png";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function parseEnv(raw) {
  return Object.fromEntries(
    raw
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const payload = await response.json();

  return {
    response,
    payload
  };
}

async function fetchOrder(env, orderId) {
  const response = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders?select=id,status,total_cents,paypal_order_id&limit=1&id=eq.${orderId}`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: "application/json"
      }
    }
  );
  const payload = await response.json();
  return payload[0] ?? null;
}

async function deleteOrder(env, orderId) {
  const headers = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
  };

  await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/order_items?order_id=eq.${orderId}`, {
    method: "DELETE",
    headers
  });
  await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
    method: "DELETE",
    headers
  });
}

async function verifyPayPalButton() {
  await fs.mkdir(path.dirname(screenshotPath), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 412, height: 1200 } });

  try {
    await page.goto(`${baseUrl}/p/fischer-duopower-8x40-50`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.getByRole("button", { name: "In den Warenkorb" }).click();
    await page.goto(`${baseUrl}/checkout`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.getByLabel("Name").fill("QA PayPal");
    await page.getByLabel("E-Mail").fill(`qa-paypal-ui-${Date.now()}@example.com`);
    await page.getByLabel("Telefon").fill("0521 555 000");
    await page.getByLabel("Straße & Hausnummer").fill("Niederwall 23");
    await page.getByLabel("PLZ").fill("33602");
    await page.getByLabel("Ort").fill("Bielefeld");
    await page.waitForTimeout(3500);

    const buttonLocator = page.locator(
      'iframe[src*="paypal.com"], iframe[title*="PayPal"], [data-funding-source="paypal"]'
    );
    await buttonLocator.first().waitFor({ state: "visible", timeout: 45_000 });
    await page.screenshot({ path: screenshotPath, fullPage: true });
  } finally {
    await browser.close();
  }
}

const env = parseEnv(await fs.readFile(envPath, "utf8"));
const timestamp = Date.now();
const customer = {
  fullName: "QA PayPal",
  email: `qa-paypal-${timestamp}@example.com`,
  phone: "0521 555 000",
  street: "Niederwall 23",
  postalCode: "33602",
  city: "Bielefeld",
  notes: "Local PayPal QA"
};
const items = [{ productId: "fischer-duopower-8x40-50", quantity: 1 }];
const createdOrderIds = [];

try {
  const configResponse = await fetch(`${baseUrl}/api/paypal/config`);
  const configPayload = await configResponse.json();
  assert(configResponse.ok, "PayPal config route failed.");
  assert(configPayload.enabled === true, "PayPal config is not enabled.");

  const createOne = await postJson(`${baseUrl}/api/paypal/orders`, { customer, items });
  assert(createOne.response.ok, `Create order failed: ${createOne.payload.error ?? "unknown"}`);
  assert(createOne.payload.paypalOrderId, "PayPal order id missing from create route.");
  createdOrderIds.push(createOne.payload.internalOrderId);

  const pendingOrder = await fetchOrder(env, createOne.payload.internalOrderId);
  assert(pendingOrder?.status === "payment_pending", "Created order is not payment_pending.");

  const cancelResult = await postJson(
    `${baseUrl}/api/paypal/orders/${createOne.payload.internalOrderId}/cancel`,
    {}
  );
  assert(cancelResult.response.ok, "Cancel route failed.");
  const cancelledOrder = await fetchOrder(env, createOne.payload.internalOrderId);
  assert(cancelledOrder?.status === "payment_cancelled", "Cancelled order did not persist.");

  const createTwo = await postJson(`${baseUrl}/api/paypal/orders`, { customer, items });
  assert(createTwo.response.ok, `Second create order failed: ${createTwo.payload.error ?? "unknown"}`);
  createdOrderIds.push(createTwo.payload.internalOrderId);

  const mismatchCapture = await postJson(
    `${baseUrl}/api/paypal/orders/${createTwo.payload.internalOrderId}/capture`,
    { paypalOrderId: "WRONG-ID" }
  );
  assert(mismatchCapture.response.status === 409, "Mismatched capture did not return 409.");
  const pendingAfterMismatch = await fetchOrder(env, createTwo.payload.internalOrderId);
  assert(
    pendingAfterMismatch?.status === "payment_pending",
    "Validation-path capture unexpectedly changed the order status."
  );

  const markFailure = await postJson(
    `${baseUrl}/api/paypal/orders/${createTwo.payload.internalOrderId}/failure`,
    { reason: "QA failure path" }
  );
  assert(markFailure.response.ok, "Failure route failed.");
  const failedOrder = await fetchOrder(env, createTwo.payload.internalOrderId);
  assert(failedOrder?.status === "payment_failed", "Failure route did not persist payment_failed.");

  const manualOrder = await postJson(`${baseUrl}/api/order-request`, { customer, items });
  assert(manualOrder.response.ok, `Manual order request failed: ${manualOrder.payload.error ?? "unknown"}`);
  createdOrderIds.push(manualOrder.payload.orderId);
  const requestOrder = await fetchOrder(env, manualOrder.payload.orderId);
  assert(requestOrder?.status === "request_pending", "Manual fallback order did not stay request_pending.");

  await verifyPayPalButton();

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        screenshotPath,
        verified: {
          config: true,
          createOrder: createOne.payload.internalOrderId,
          cancelOrder: createOne.payload.internalOrderId,
          validationFailureOrder: createTwo.payload.internalOrderId,
          manualFallbackOrder: manualOrder.payload.orderId,
          paypalButtonRendered: true
        },
        captureHappyPathVerifiedLive: false,
        reason:
          "Sandbox merchant credentials were available, but no sandbox buyer approval credentials were available for a real live capture."
      },
      null,
      2
    )
  );
} finally {
  await Promise.all(createdOrderIds.map((orderId) => deleteOrder(env, orderId).catch(() => undefined)));
}
