import { NextResponse } from "next/server";
import { getPayPalEnvironment } from "@/lib/paypal";

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID || "";
  const secret = process.env.PAYPAL_CLIENT_SECRET || "";

  return NextResponse.json({
    enabled: Boolean(clientId),
    ordersEnabled: Boolean(clientId && secret),
    environment: getPayPalEnvironment(),
    flow: "redirect",
    currency: "EUR",
    intent: "capture",
  });
}
