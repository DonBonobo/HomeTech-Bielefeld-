import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { persistCapturedOrder } from "@/lib/order-persistence";
import { getAuthenticatedUserFromRequest } from "@/lib/supabase-server-auth";

export async function POST(request) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "auth-required" }, { status: 401 });
    }
    const { orderId } = await request.json();
    const order = await capturePayPalOrder(orderId);
    const persistence = await persistCapturedOrder(user.id, order);
    return NextResponse.json({
      id: order.id,
      status: order.status,
      payerName: order.payer?.name?.given_name || null,
      persisted: persistence.persisted,
      persistedOrderId: persistence.orderId || null,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "paypal-capture-failed" }, { status: 500 });
  }
}
