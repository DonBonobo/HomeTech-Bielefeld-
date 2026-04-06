import { afterEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/paypal/config/route";

describe("paypal config route", () => {
  const oldId = process.env.PAYPAL_CLIENT_ID;
  const oldSecret = process.env.PAYPAL_CLIENT_SECRET;

  afterEach(() => {
    process.env.PAYPAL_CLIENT_ID = oldId;
    process.env.PAYPAL_CLIENT_SECRET = oldSecret;
  });

  it("returns safe client config only", async () => {
    process.env.PAYPAL_CLIENT_ID = "client-id";
    process.env.PAYPAL_CLIENT_SECRET = "secret";
    const response = await GET();
    const payload = await response.json();

    expect(payload.enabled).toBe(true);
    expect(payload.ordersEnabled).toBe(true);
    expect(payload.clientId).toBe("client-id");
    expect(payload.secret).toBeUndefined();
  });
});
