import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StickyCartCta } from "@/components/layout/sticky-cart-cta";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("StickyCartCta", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("navigates to checkout when clicked", () => {
    render(<StickyCartCta href="/checkout" label="Zur Kasse" />);

    fireEvent.click(screen.getByRole("button", { name: "Zur Kasse" }));

    expect(push).toHaveBeenCalledWith("/checkout");
  });

  it("navigates to sets when cart is empty", () => {
    render(<StickyCartCta href="/sets" label="Set sammeln" />);

    fireEvent.click(screen.getByRole("button", { name: "Set sammeln" }));

    expect(push).toHaveBeenCalledWith("/sets");
  });
});
