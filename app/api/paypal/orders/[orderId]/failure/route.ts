import { NextResponse } from "next/server";
import {
  buildOrderPayload,
  CheckoutError,
  getStoredOrder,
  parseOrderPayload,
  updateStoredOrder
} from "@/lib/checkout";

export const runtime = "nodejs";

type FailureBody = {
  reason?: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  const body = (await request.json()) as FailureBody;

  try {
    const storedOrder = await getStoredOrder(orderId);
    const payload = parseOrderPayload(storedOrder.paypal_order_id);

    if (!payload || payload.mode !== "paypal_checkout" || !payload.payment) {
      throw new CheckoutError("PayPal Bestellung nicht gefunden.", 404);
    }

    if (storedOrder.status === "paid") {
      throw new CheckoutError("Diese Bestellung wurde bereits bezahlt.", 409);
    }

    const nextPayload = buildOrderPayload("paypal_checkout", payload.customer, payload.items, {
      ...payload.payment,
      status: "FAILED",
      lastEventAt: new Date().toISOString(),
      lastError: body.reason?.trim() || "PayPal Checkout wurde nicht abgeschlossen."
    });

    await updateStoredOrder(orderId, "payment_failed", nextPayload);

    return NextResponse.json({
      ok: true,
      orderId
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "PayPal Fehler konnte nicht gespeichert werden."
      },
      { status: error instanceof CheckoutError ? error.status : 500 }
    );
  }
}
