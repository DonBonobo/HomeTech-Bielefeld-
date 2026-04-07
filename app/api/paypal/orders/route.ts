import { NextResponse } from "next/server";
import {
  buildOrderPayload,
  CheckoutError,
  createStoredOrder,
  prepareCheckout,
  updateStoredOrder
} from "@/lib/checkout";
import type { CheckoutRequestBody } from "@/lib/checkout-types";
import { createPayPalOrder, getPayPalClientConfig, PayPalError } from "@/lib/paypal";

export const runtime = "nodejs";

function getErrorStatus(error: unknown) {
  if (error instanceof CheckoutError || error instanceof PayPalError) {
    return error.status;
  }

  return 500;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function POST(request: Request) {
  const config = getPayPalClientConfig();

  if (!config.enabled) {
    return NextResponse.json(
      {
        ok: false,
        error: "PayPal ist noch nicht vollständig konfiguriert."
      },
      { status: 503 }
    );
  }

  let internalOrderId = "";
  let pendingPayload:
    | ReturnType<typeof buildOrderPayload>
    | null = null;

  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const prepared = await prepareCheckout(body);

    pendingPayload = buildOrderPayload("paypal_checkout", prepared.customer, prepared.items, {
      provider: "paypal",
      environment: config.environment,
      currency: config.currency,
      amountCents: prepared.totalCents,
      status: "CREATING",
      lastEventAt: new Date().toISOString()
    });

    internalOrderId = await createStoredOrder({
      status: "payment_pending",
      totalCents: prepared.totalCents,
      payload: pendingPayload,
      items: prepared.items
    });

    const paypalOrder = await createPayPalOrder({
      internalOrderId,
      totalCents: prepared.totalCents,
      items: prepared.items
    });

    const activePayload = buildOrderPayload("paypal_checkout", prepared.customer, prepared.items, {
      provider: "paypal",
      environment: config.environment,
      currency: config.currency,
      paypalOrderId: paypalOrder.id,
      amountCents: prepared.totalCents,
      status: paypalOrder.status,
      lastEventAt: new Date().toISOString(),
      rawCreateOrder: paypalOrder
    });

    await updateStoredOrder(internalOrderId, "payment_pending", activePayload);

    return NextResponse.json({
      ok: true,
      internalOrderId,
      paypalOrderId: paypalOrder.id
    });
  } catch (error) {
    if (internalOrderId) {
      try {
        const failedPayload = pendingPayload
          ? buildOrderPayload("paypal_checkout", pendingPayload.customer, pendingPayload.items, {
              provider: "paypal",
              environment: config.environment,
              currency: config.currency,
              paypalOrderId: pendingPayload.payment?.paypalOrderId,
              captureId: pendingPayload.payment?.captureId,
              amountCents: pendingPayload.payment?.amountCents,
              rawCreateOrder: pendingPayload.payment?.rawCreateOrder,
              rawCaptureOrder: pendingPayload.payment?.rawCaptureOrder,
              status: "CREATE_FAILED",
              lastEventAt: new Date().toISOString(),
              lastError: getErrorMessage(error, "PayPal Bestellung konnte nicht vorbereitet werden.")
            })
          : buildOrderPayload(
              "paypal_checkout",
              {
                fullName: "",
                email: "",
                phone: "",
                street: "",
                postalCode: "",
                city: "",
                notes: ""
              },
              [],
              {
                provider: "paypal",
                environment: config.environment,
                currency: config.currency,
                status: "CREATE_FAILED",
                lastEventAt: new Date().toISOString(),
                lastError: getErrorMessage(error, "PayPal Bestellung konnte nicht vorbereitet werden.")
              }
            );
        await updateStoredOrder(internalOrderId, "payment_failed", failedPayload);
      } catch {}
    }

    return NextResponse.json(
      {
        ok: false,
        error: getErrorMessage(error, "PayPal Bestellung konnte nicht vorbereitet werden.")
      },
      { status: getErrorStatus(error) }
    );
  }
}
