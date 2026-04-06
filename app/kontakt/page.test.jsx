import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import KontaktPage from "@/app/kontakt/page";

const authState = {
  user: { id: "user-1", email: "kunde@example.com" },
  ready: true,
};

vi.mock("next/navigation", () => ({
  usePathname: () => "/kontakt",
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => authState,
}));

describe("KontaktPage", () => {
  it("renders support route for signed-in users", () => {
    render(<KontaktPage />);
    expect(screen.getByText("Support")).toBeInTheDocument();
  });

  it("stores a support message and shows the history state", () => {
    window.localStorage.clear();
    render(<KontaktPage />);

    fireEvent.change(screen.getByPlaceholderText("Betreff"), { target: { value: "Bestellung" } });
    fireEvent.change(screen.getByPlaceholderText("Nachricht"), { target: { value: "Wann wird geliefert?" } });
    fireEvent.click(screen.getByRole("button", { name: "Nachricht senden" }));

    expect(screen.getByText("Bestellung")).toBeInTheDocument();
  });
});
