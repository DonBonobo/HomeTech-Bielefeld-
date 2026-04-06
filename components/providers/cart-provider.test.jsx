import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/components/providers/cart-provider";

let authState = { supabase: null, user: null, ready: true };

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => authState,
}));

vi.mock("@/components/providers/storefront-provider", () => ({
  useStorefront: () => ({
    products: [
      { id: "white-e14-candle-470", title: "White", priceCents: 1699, quantity: 0 },
      { id: "white-color-e14-candle-470", title: "Color", priceCents: 2999, quantity: 0 },
    ],
  }),
}));

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
    authState = { supabase: null, user: null, ready: true };
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

  it("preserves a guest cart when the user signs in", async () => {
    window.localStorage.setItem("hometech.next.cart.guest.v2", JSON.stringify([{ id: "white-e14-candle-470", quantity: 2 }]));

    const view = render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("2");
    });

    authState = { supabase: null, user: { id: "user-1" }, ready: true };
    view.rerender(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("2");
    });
  });

  it("merges a guest cart on initial signed-in hydration", async () => {
    window.localStorage.setItem("hometech.next.cart.guest.v2", JSON.stringify([{ id: "white-e14-candle-470", quantity: 2 }]));
    window.localStorage.setItem("hometech.next.cart.user.user-1", JSON.stringify([{ id: "white-color-e14-candle-470", quantity: 1 }]));
    authState = { supabase: null, user: { id: "user-1" }, ready: true };

    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("3");
    });
  });
});
