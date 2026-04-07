import { NextResponse } from "next/server";
import {
  buildOrderPayload,
  CheckoutError,
  getStoredOrder,
  parseOrderPayload,
  updateStoredOrder
} from "@/lib/checkout";
import { capturePayPalOrder, PayPalError, validateCapturedAmount } from "@/lib/paypal";

export const runtime = "nodejs";

type CaptureBody = {
  paypalOrderId?: string;
};

function getErrorStatus(error: unknown) {
  if (error instanceof CheckoutError || error instanceof PayPalError) {
    return error.status;
  }

  return 500;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  const body = (await request.json()) as CaptureBody;

  try {
    const storedOrder = await getStoredOrder(orderId);
    const payload = parseOrderPayload(storedOrder.paypal_order_id);

    if (!payload || payload.mode !== "paypal_checkout" || !payload.payment?.paypalOrderId) {
      throw new CheckoutError("PayPal Bestellung nicht gefunden.", 404);
    }

    if (body.paypalOrderId && body.paypalOrderId !== payload.payment.paypalOrderId) {
      throw new CheckoutError("PayPal Bestellnummer passt nicht zu dieser Bestellung.", 409);
    }

    if (storedOrder.status === "paid") {
      return NextResponse.json({
        ok: true,
        orderId,
        captureId: payload.payment.captureId ?? null,
        paidAt: payload.payment.paidAt ?? null
      });
    }

    if (storedOrder.status === "payment_cancelled") {
      throw new CheckoutError("Diese PayPal Zahlung wurde bereits abgebrochen.", 409);
    }

    const capture = await capturePayPalOrder({
      internalOrderId: orderId,
      paypalOrderId: payload.payment.paypalOrderId
    });
    const completedCapture = validateCapturedAmount(storedOrder.total_cents, orderId, capture);

    const nextPayload = buildOrderPayload("paypal_checkout", payload.customer, payload.items, {
      ...payload.payment,
      captureId: completedCapture?.id,
      amountCents: storedOrder.total_cents,
      paidAt: completedCapture?.create_time ?? new Date().toISOString(),
      status: capture.status,
      lastEventAt: new Date().toISOString(),
      rawCaptureOrder: capture
    });

    await updateStoredOrder(orderId, "paid", nextPayload);

    return NextResponse.json({
      ok: true,
      orderId,
      captureId: completedCapture?.id ?? null,
      paidAt: completedCapture?.create_time ?? null,
      payerName: capture.payer?.name?.given_name ?? null
    });
  } catch (error) {
    if (!(error instanceof CheckoutError)) {
      try {
        const storedOrder = await getStoredOrder(orderId);
        const payload = parseOrderPayload(storedOrder.paypal_order_id);
        if (payload?.mode === "paypal_checkout" && storedOrder.status !== "paid") {
          const failedPayload = buildOrderPayload("paypal_checkout", payload.customer, payload.items, {
            provider: "paypal",
            environment: payload.payment?.environment ?? "sandbox",
            currency: payload.payment?.currency ?? "EUR",
            paypalOrderId: payload.payment?.paypalOrderId,
            captureId: payload.payment?.captureId,
            amountCents: payload.payment?.amountCents,
            rawCreateOrder: payload.payment?.rawCreateOrder,
            rawCaptureOrder: payload.payment?.rawCaptureOrder,
            status: "CAPTURE_FAILED",
            lastEventAt: new Date().toISOString(),
            lastError: getErrorMessage(error, "PayPal Zahlung konnte nicht bestätigt werden.")
          });
          await updateStoredOrder(orderId, "payment_failed", failedPayload);
        }
      } catch {}
    }

    return NextResponse.json(
      {
        ok: false,
        error: getErrorMessage(error, "PayPal Zahlung konnte nicht bestätigt werden.")
      },
      { status: getErrorStatus(error) }
    );
  }
}
