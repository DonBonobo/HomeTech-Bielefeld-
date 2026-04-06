import { afterEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/paypal/config/route";

describe("paypal config route", () => {
  const oldId = process.env.PAYPAL_CLIENT_ID;
  const oldSecret = process.env.PAYPAL_CLIENT_SECRET;
  const oldEnv = process.env.PAYPAL_ENV;

  afterEach(() => {
    process.env.PAYPAL_CLIENT_ID = oldId;
    process.env.PAYPAL_CLIENT_SECRET = oldSecret;
    process.env.PAYPAL_ENV = oldEnv;
  });

  it("returns safe client config only", async () => {
    process.env.PAYPAL_CLIENT_ID = "client-id";
    process.env.PAYPAL_CLIENT_SECRET = "secret";
    process.env.PAYPAL_ENV = "live";
    const response = await GET();
    const payload = await response.json();

    expect(payload.enabled).toBe(true);
    expect(payload.ordersEnabled).toBe(true);
    expect(payload.environment).toBe("live");
    expect(payload.flow).toBe("redirect");
    expect(payload.clientId).toBeUndefined();
    expect(payload.secret).toBeUndefined();
  });
});
