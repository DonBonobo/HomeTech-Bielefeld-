import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CheckoutPage from "@/app/checkout/page";

const authState = {
  user: null,
  ready: true,
};

const cartState = {
  cartItems: [
    {
      id: "white-ambiance-e27-1100",
      image: "/assets/products/philips-hue-white-ambiance-e27-1100.png",
      title: "Philips Hue White Ambiance E27 1100",
      priceCents: 2499,
      spec: "E27 · 1100 lm",
      quantity: 1,
    },
  ],
  updateQuantity: vi.fn(),
};

vi.mock("next/navigation", () => ({
  usePathname: () => "/checkout",
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => authState,
}));

vi.mock("@/components/providers/cart-provider", () => ({
  useCart: () => cartState,
}));

vi.mock("@/components/shop/paypal-checkout-panel", () => ({
  PayPalCheckoutPanel: () => <div>PayPal Panel</div>,
}));

vi.mock("@/components/shop/card-checkout-panel", () => ({
  CardCheckoutPanel: () => <div>Karten Panel</div>,
}));

describe("CheckoutPage", () => {
  it("requires login before showing payment panels", () => {
    authState.user = null;
    render(<CheckoutPage />);

    expect(screen.getByText("Bitte melde dich vor der Bezahlung an.")).toBeInTheDocument();
    expect(screen.queryByText("PayPal Panel")).not.toBeInTheDocument();
  });

  it("shows payment panels for signed-in users", () => {
    authState.user = { id: "user-1" };
    render(<CheckoutPage />);

    expect(screen.getByText("PayPal Panel")).toBeInTheDocument();
    expect(screen.getByText("Karten Panel")).toBeInTheDocument();
    authState.user = null;
  });
});
