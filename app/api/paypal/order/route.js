import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";

export async function POST(request) {
  try {
    const { totalCents } = await request.json();
    const order = await createPayPalOrder(totalCents);
    return NextResponse.json({ id: order.id });
  } catch (error) {
    return NextResponse.json({ error: error.message || "paypal-order-failed" }, { status: 500 });
  }
}
