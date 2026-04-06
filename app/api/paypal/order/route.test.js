import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/paypal", () => ({
  createPayPalOrder: vi.fn(async () => ({
    id: "ORDER-123",
    links: [{ rel: "payer-action", href: "https://paypal.test/approve/ORDER-123" }],
  })),
}));

const { getAuthenticatedUserFromRequest } = vi.hoisted(() => ({
  getAuthenticatedUserFromRequest: vi.fn(async () => ({ id: "user-1" })),
}));

vi.mock("@/lib/supabase-server-auth", () => ({
  getAuthenticatedUserFromRequest,
}));

import { POST } from "@/app/api/paypal/order/route";

describe("paypal order route", () => {
  it("creates an order id and approval url", async () => {
    const request = new Request("http://localhost/api/paypal/order", {
      method: "POST",
      body: JSON.stringify({ totalCents: 1999, returnUrl: "http://localhost/checkout?paypal=approved", cancelUrl: "http://localhost/checkout?paypal=cancelled" }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(payload.id).toBe("ORDER-123");
    expect(payload.approveUrl).toBe("https://paypal.test/approve/ORDER-123");
  });

  it("rejects unauthenticated requests", async () => {
    getAuthenticatedUserFromRequest.mockResolvedValueOnce(null);
    const request = new Request("http://localhost/api/paypal/order", {
      method: "POST",
      body: JSON.stringify({ totalCents: 1999 }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("auth-required");
  });
});
