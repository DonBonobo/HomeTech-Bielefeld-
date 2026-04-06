import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID || "";
  const secret = process.env.PAYPAL_CLIENT_SECRET || "";

  return NextResponse.json({
    enabled: Boolean(clientId),
    ordersEnabled: Boolean(clientId && secret),
    clientId,
    currency: "EUR",
    intent: "capture",
  });
}
