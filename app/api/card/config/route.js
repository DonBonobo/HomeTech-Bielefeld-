import { NextResponse } from "next/server";

export async function GET() {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || "";
  const secretKey = process.env.STRIPE_SECRET_KEY || "";

  return NextResponse.json({
    enabled: Boolean(publishableKey && secretKey),
    provider: "stripe",
    publishableKey: publishableKey || null,
  });
}
