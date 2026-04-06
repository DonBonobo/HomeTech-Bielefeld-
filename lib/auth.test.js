import { describe, expect, it } from "vitest";
import {
  buildAuthRedirectUrl,
  hasAuthLikeHash,
  normalizeAuthReturnUrl,
  sanitizeNextPath,
  sanitizePathname,
  shouldRedirectAfterAuth,
} from "@/lib/auth";

describe("auth helpers", () => {
  it("keeps only safe internal next paths", () => {
    expect(sanitizeNextPath("/checkout")).toBe("/checkout");
    expect(sanitizeNextPath("https://example.com")).toBe("/konto");
    expect(sanitizeNextPath("//evil.example")).toBe("/konto");
    expect(sanitizeNextPath("/konto\u2060\uFFFD?next=%2Fcheckout")).toBe("/konto?next=/checkout");
    expect(sanitizeNextPath("http://localhost:3000/checkout", "/konto", "https://home-tech-bielefeld.vercel.app")).toBe("/checkout");
    expect(sanitizeNextPath("https://home-tech-bielefeld.vercel.app/checkout", "/konto", "http://localhost:3000")).toBe("/checkout");
  });

  it("sanitizes broken incoming pathnames", () => {
    expect(sanitizePathname("/konto\u2060\uFFFD")).toBe("/konto");
    expect(sanitizePathname("//konto", "/konto")).toBe("/konto");
  });

  it("builds account callback urls with next path", () => {
    expect(buildAuthRedirectUrl("https://shop.example", "/checkout")).toBe("https://shop.example/konto?next=%2Fcheckout");
  });

  it("builds account callback urls with extra params", () => {
    expect(buildAuthRedirectUrl("https://shop.example", "/checkout", { mode: "passwort" })).toBe(
      "https://shop.example/konto?next=%2Fcheckout&mode=passwort"
    );
  });

  it("redirects only when next path is not account", () => {
    expect(shouldRedirectAfterAuth("/checkout")).toBe(true);
    expect(shouldRedirectAfterAuth("/konto")).toBe(false);
  });

  it("detects auth-like hash fragments", () => {
    expect(hasAuthLikeHash("#access_token=test&refresh_token=test")).toBe(true);
    expect(hasAuthLikeHash("#")).toBe(true);
    expect(hasAuthLikeHash("#section")).toBe(false);
  });

  it("normalizes root auth hash returns to a clean account url", () => {
    expect(
      normalizeAuthReturnUrl("https://shop.example/#access_token=test&refresh_token=test", "/konto", "/checkout")
    ).toBe("/konto?next=%2Fcheckout");
  });

  it("removes auth hashes from account callback urls without changing the route", () => {
    expect(
      normalizeAuthReturnUrl("https://shop.example/konto?next=%2Fcheckout#access_token=test", "/konto", "/checkout")
    ).toBe("/konto?next=%2Fcheckout");
  });

  it("normalizes localhost absolute next params to the current app path", () => {
    expect(
      normalizeAuthReturnUrl(
        "https://home-tech-bielefeld.vercel.app/konto?next=http%3A%2F%2Flocalhost%3A3000%2Fcheckout#access_token=test",
        "/konto",
        "/konto"
      )
    ).toBe("/konto?next=%2Fcheckout");
  });
});
