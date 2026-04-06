import { describe, expect, it } from "vitest";
import { bundleProgress, cartSubtotal } from "@/lib/commerce";

describe("commerce helpers", () => {
  it("applies the 20% set discount at four qualifying items", () => {
    const progress = bundleProgress([
      { id: "a", priceCents: 1000, quantity: 2 },
      { id: "b", priceCents: 2500, quantity: 2 },
    ]);

    expect(progress.quantity).toBe(4);
    expect(progress.unlocked).toBe(true);
    expect(progress.itemsNeeded).toBe(0);
    expect(progress.discountCents).toBe(1400);
  });

  it("keeps subtotal separate from discount calculation", () => {
    const subtotal = cartSubtotal([
      { id: "a", priceCents: 1699, quantity: 1 },
      { id: "b", priceCents: 2999, quantity: 2 },
    ]);

    expect(subtotal).toBe(7697);
  });
});
