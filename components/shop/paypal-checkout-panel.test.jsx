import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PayPalCheckoutPanel } from "@/components/shop/paypal-checkout-panel";

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({ session: { access_token: "token-1" } }),
}));

describe("PayPalCheckoutPanel", () => {
  beforeEach(() => {
    global.fetch = vi.fn(async (url) => {
      if (url === "/api/paypal/config") {
        return {
          json: async () => ({
            enabled: true,
            ordersEnabled: true,
            clientId: "client-id",
            currency: "EUR",
            intent: "capture",
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({ id: "ORDER-1" }),
      };
    });

    window.paypal = {
      Buttons: () => ({
        render: () => Promise.resolve(),
      }),
    };
  });

  it("loads the checkout ui when config is available", async () => {
    render(<PayPalCheckoutPanel totalCents={1999} disabled={false} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/paypal/config", { cache: "no-store" });
    });

    expect(screen.getByText("PayPal")).toBeInTheDocument();
    expect(screen.getByTestId("paypal-button-host")).toBeInTheDocument();
  });
});
