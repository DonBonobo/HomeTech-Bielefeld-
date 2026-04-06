import { describe, expect, it } from "vitest";
import { buildAuthRedirectUrl, sanitizeNextPath, shouldRedirectAfterAuth } from "@/lib/auth";

describe("auth helpers", () => {
  it("keeps only safe internal next paths", () => {
    expect(sanitizeNextPath("/checkout")).toBe("/checkout");
    expect(sanitizeNextPath("https://example.com")).toBe("/konto");
    expect(sanitizeNextPath("//evil.example")).toBe("/konto");
  });

  it("builds account callback urls with next path", () => {
    expect(buildAuthRedirectUrl("https://shop.example", "/checkout")).toBe("https://shop.example/konto?next=%2Fcheckout");
  });

  it("redirects only when next path is not account", () => {
    expect(shouldRedirectAfterAuth("/checkout")).toBe(true);
    expect(shouldRedirectAfterAuth("/konto")).toBe(false);
  });
});
