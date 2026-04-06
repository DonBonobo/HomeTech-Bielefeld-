import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductCard } from "@/components/shop/product-card";

let cartState = {
  addItem: vi.fn(),
  updateQuantity: vi.fn(),
  getQuantity: vi.fn(() => 0),
};

vi.mock("@/components/providers/cart-provider", () => ({
  useCart: () => cartState,
}));

const product = {
  id: "white-e14-candle-470",
  slug: "philips-hue-white-e14-kerze-470",
  title: "Philips Hue White E14 Kerze 470",
  line: "White",
  short: "Warmes Licht für Tisch- und Fensterleuchten.",
  priceCents: 1699,
  stockLabel: "Auf Lager",
  spec: "E14 · 470 lm",
  compatibility: ["Bluetooth"],
  image: "/assets/products/philips-hue-white-e14-candle-470.png",
};

describe("ProductCard", () => {
  beforeEach(() => {
    cartState = {
      addItem: vi.fn(),
      updateQuantity: vi.fn(),
      getQuantity: vi.fn(() => 0),
    };
  });

  it("shows add-to-cart by default", () => {
    render(<ProductCard product={product} />);
    expect(screen.getByRole("button", { name: "In den Warenkorb" })).toBeInTheDocument();
  });

  it("replaces add-to-cart with quantity controls after adding", () => {
    cartState.getQuantity = vi.fn(() => 2);
    render(<ProductCard product={product} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "−" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
  });

  it("returns to add-to-cart when quantity goes back to zero", () => {
    const view = render(<ProductCard product={product} />);
    expect(screen.getByRole("button", { name: "In den Warenkorb" })).toBeInTheDocument();

    cartState.getQuantity = vi.fn(() => 0);
    view.rerender(<ProductCard product={product} />);
    fireEvent.click(screen.getByRole("button", { name: "In den Warenkorb" }));
    expect(cartState.addItem).toHaveBeenCalledWith(product.id);
  });
});
