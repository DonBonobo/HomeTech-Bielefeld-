import { describe, expect, it } from "vitest";
import { cartSubtotal } from "@/lib/commerce";

describe("commerce helpers", () => {
  it("calculates subtotal across cart items", () => {
    const subtotal = cartSubtotal([
      { id: "a", priceCents: 1699, quantity: 1 },
      { id: "b", priceCents: 2999, quantity: 2 },
    ]);

    expect(subtotal).toBe(7697);
  });
});
