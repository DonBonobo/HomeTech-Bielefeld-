import { NextResponse } from "next/server";
import {
  buildOrderPayload,
  CheckoutError,
  createStoredOrder,
  prepareCheckout
} from "@/lib/checkout";
import type { CheckoutRequestBody } from "@/lib/checkout-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const prepared = await prepareCheckout(body);
    const payload = buildOrderPayload("order_request", prepared.customer, prepared.items);
    const orderId = await createStoredOrder({
      status: "request_pending",
      totalCents: prepared.totalCents,
      payload,
      items: prepared.items
    });

    return NextResponse.json({
      ok: true,
      orderId
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Die Bestellanfrage konnte gerade nicht gespeichert werden."
      },
      { status: error instanceof CheckoutError ? error.status : 500 }
    );
  }
}
