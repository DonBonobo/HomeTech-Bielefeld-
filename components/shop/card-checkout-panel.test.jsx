import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CardCheckoutPanel } from "@/components/shop/card-checkout-panel";

describe("CardCheckoutPanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders separate card payment messaging", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({ enabled: false, provider: "stripe" }),
    });

    render(<CardCheckoutPanel disabled={false} />);

    expect(screen.getByText("Kredit- oder Debitkarte")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Kartenzahlung wird nach der Freischaltung separat aktiviert.")).toBeInTheDocument();
    });
    expect(screen.queryByPlaceholderText("Kartennummer")).not.toBeInTheDocument();
  });
});
