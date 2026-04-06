import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/paypal", () => ({
  capturePayPalOrder: vi.fn(async () => ({
    id: "ORDER-123",
    status: "COMPLETED",
    payer: { name: { given_name: "Max" } },
  })),
}));

vi.mock("@/lib/order-persistence", () => ({
  persistCapturedOrder: vi.fn(async () => ({
    persisted: true,
    orderId: "db-order-1",
  })),
}));

const { getAuthenticatedUserFromRequest } = vi.hoisted(() => ({
  getAuthenticatedUserFromRequest: vi.fn(async () => ({ id: "user-1" })),
}));

vi.mock("@/lib/supabase-server-auth", () => ({
  getAuthenticatedUserFromRequest,
}));

import { POST } from "@/app/api/paypal/capture/route";

describe("paypal capture route", () => {
  it("captures an order and returns confirmation data", async () => {
    const request = new Request("http://localhost/api/paypal/capture", {
      method: "POST",
      body: JSON.stringify({ orderId: "ORDER-123" }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(payload.status).toBe("COMPLETED");
    expect(payload.payerName).toBe("Max");
    expect(payload.persisted).toBe(true);
    expect(payload.persistedOrderId).toBe("db-order-1");
  });

  it("rejects unauthenticated capture requests", async () => {
    getAuthenticatedUserFromRequest.mockResolvedValueOnce(null);
    const request = new Request("http://localhost/api/paypal/capture", {
      method: "POST",
      body: JSON.stringify({ orderId: "ORDER-123" }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("auth-required");
  });
});
