import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";

export async function POST(request) {
  try {
    const { orderId } = await request.json();
    const order = await capturePayPalOrder(orderId);
    return NextResponse.json({
      id: order.id,
      status: order.status,
      payerName: order.payer?.name?.given_name || null,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "paypal-capture-failed" }, { status: 500 });
  }
}
