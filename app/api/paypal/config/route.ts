import { NextResponse } from "next/server";
import { getPayPalClientConfig } from "@/lib/paypal";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getPayPalClientConfig(), {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
