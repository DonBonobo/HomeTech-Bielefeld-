import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PayPalCheckoutPanel } from "@/components/shop/paypal-checkout-panel";

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({ session: { access_token: "token-1" } }),
}));

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/checkout",
  useSearchParams: () => new URLSearchParams(""),
}));

describe("PayPalCheckoutPanel", () => {
  beforeEach(() => {
    global.fetch = vi.fn(async (url) => {
      if (url === "/api/paypal/config") {
        return {
          ok: true,
          json: async () => ({
            enabled: true,
            ordersEnabled: true,
            environment: "sandbox",
            flow: "redirect",
            currency: "EUR",
            intent: "capture",
          }),
        };
      }
      if (url === "/api/paypal/order") {
        return {
          ok: true,
          json: async () => ({ id: "ORDER-1", approveUrl: "https://paypal.test/approve/ORDER-1" }),
        };
      }
      return {
        ok: true,
        json: async () => ({ id: "ORDER-1" }),
      };
    });
    delete window.location;
    window.location = { origin: "http://localhost:3000", assign: vi.fn() };
    replace.mockReset();
  });

  it("loads the checkout ui when config is available", async () => {
    render(<PayPalCheckoutPanel totalCents={1999} disabled={false} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/paypal/config", { cache: "no-store" });
    });

    expect(screen.getByText("PayPal")).toBeInTheDocument();
    expect(screen.getByTestId("paypal-redirect-button")).toBeInTheDocument();
    expect(screen.queryByTestId("paypal-button-host")).not.toBeInTheDocument();
  });

  it("starts the redirect checkout flow", async () => {
    render(<PayPalCheckoutPanel totalCents={1999} disabled={false} />);

    await waitFor(() => {
      expect(screen.getByTestId("paypal-redirect-button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("paypal-redirect-button"));

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith("https://paypal.test/approve/ORDER-1");
    });
  });
});
