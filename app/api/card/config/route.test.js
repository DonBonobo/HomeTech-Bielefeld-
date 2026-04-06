import { describe, expect, it, vi } from "vitest";

describe("GET /api/card/config", () => {
  it("returns disabled when Stripe keys are missing", async () => {
    vi.resetModules();
    process.env.STRIPE_PUBLISHABLE_KEY = "";
    process.env.STRIPE_SECRET_KEY = "";
    const { GET } = await import("@/app/api/card/config/route");

    const response = await GET();
    const payload = await response.json();

    expect(payload.enabled).toBe(false);
    expect(payload.provider).toBe("stripe");
  });
});
