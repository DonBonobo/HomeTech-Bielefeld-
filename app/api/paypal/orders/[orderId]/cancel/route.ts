import { NextResponse } from "next/server";
import {
  buildOrderPayload,
  CheckoutError,
  getStoredOrder,
  parseOrderPayload,
  updateStoredOrder
} from "@/lib/checkout";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;

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
      status: "CANCELLED",
      lastEventAt: new Date().toISOString(),
      lastError: "Kauf im PayPal Fenster abgebrochen."
    });

    await updateStoredOrder(orderId, "payment_cancelled", nextPayload);

    return NextResponse.json({
      ok: true,
      orderId
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "PayPal Abbruch konnte nicht gespeichert werden."
      },
      { status: error instanceof CheckoutError ? error.status : 500 }
    );
  }
}
