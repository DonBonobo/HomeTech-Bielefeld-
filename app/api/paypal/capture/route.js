import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { getAuthenticatedUserFromRequest } from "@/lib/supabase-server-auth";

export async function POST(request) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "auth-required" }, { status: 401 });
    }
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
