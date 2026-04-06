import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/paypal", () => ({
  capturePayPalOrder: vi.fn(async () => ({
    id: "ORDER-123",
    status: "COMPLETED",
    payer: { name: { given_name: "Max" } },
  })),
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
  });
});
