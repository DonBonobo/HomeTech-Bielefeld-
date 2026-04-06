import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID || "";

  return NextResponse.json({
    enabled: Boolean(clientId),
    clientId,
    currency: "EUR",
    intent: "capture",
  });
}
