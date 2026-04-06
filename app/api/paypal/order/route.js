import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { getAuthenticatedUserFromRequest } from "@/lib/supabase-server-auth";

export async function POST(request) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "auth-required" }, { status: 401 });
    }
    const { totalCents, returnUrl, cancelUrl } = await request.json();
    const order = await createPayPalOrder(totalCents, { returnUrl, cancelUrl });
    const approveUrl = order.links?.find((entry) => entry.rel === "payer-action")?.href || null;
    return NextResponse.json({ id: order.id, approveUrl });
  } catch (error) {
    return NextResponse.json({ error: error.message || "paypal-order-failed" }, { status: 500 });
  }
}
