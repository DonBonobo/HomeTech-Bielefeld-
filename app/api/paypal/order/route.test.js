import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/paypal", () => ({
  createPayPalOrder: vi.fn(async () => ({ id: "ORDER-123" })),
}));

import { POST } from "@/app/api/paypal/order/route";

describe("paypal order route", () => {
  it("creates an order id", async () => {
    const request = new Request("http://localhost/api/paypal/order", {
      method: "POST",
      body: JSON.stringify({ totalCents: 1999 }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(payload.id).toBe("ORDER-123");
  });
});
