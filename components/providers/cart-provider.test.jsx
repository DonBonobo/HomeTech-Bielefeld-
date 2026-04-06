import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CartProvider, useCart } from "@/components/providers/cart-provider";

function CartHarness() {
  const { cartItems, addItem, updateQuantity } = useCart();

  return (
    <div>
      <button type="button" onClick={() => addItem("white-e14-candle-470")}>add-white</button>
      <button type="button" onClick={() => addItem("white-color-e14-candle-470")}>add-color</button>
      <button type="button" onClick={() => updateQuantity("white-e14-candle-470", -1)}>remove-white</button>
      <span data-testid="count">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
    </div>
  );
}

describe("CartProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("updates cart quantity across multiple products", () => {
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "add-white" }));
    fireEvent.click(screen.getByRole("button", { name: "add-white" }));
    fireEvent.click(screen.getByRole("button", { name: "add-color" }));
    fireEvent.click(screen.getByRole("button", { name: "add-color" }));

    expect(screen.getByTestId("count")).toHaveTextContent("4");
  });

  it("keeps quantities consistent when decrementing", () => {
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "add-white" }));
    fireEvent.click(screen.getByRole("button", { name: "remove-white" }));

    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});
