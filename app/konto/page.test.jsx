import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountPageClient } from "@/components/account/account-page";

const replace = vi.fn();

const authState = {
  user: null,
  ready: true,
  signInWithGoogle: vi.fn(async () => ({ data: {}, error: null })),
  signInWithEmail: vi.fn(async () => ({ data: {}, error: null })),
  exchangeCodeForSession: vi.fn(async () => ({ data: {}, error: null })),
  getPendingRedirect: vi.fn(() => "/checkout"),
  clearPendingRedirect: vi.fn(),
  signOut: vi.fn(async () => {}),
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams("next=%2Fcheckout"),
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => authState,
}));

describe("AccountPage", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it("renders both auth entry points", () => {
    render(<AccountPageClient />);

    expect(screen.getByRole("button", { name: "Mit Google fortfahren" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mit E-Mail anmelden" })).toBeInTheDocument();
  });

  it("starts e-mail sign-in with the current redirect path", async () => {
    render(<AccountPageClient />);

    fireEvent.change(screen.getByPlaceholderText("E-Mail-Adresse"), { target: { value: "kunde@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Mit E-Mail anmelden" }));

    await waitFor(() => {
      expect(authState.signInWithEmail).toHaveBeenCalledWith("kunde@example.com", "/checkout");
    });
  });

  it("redirects signed-in users to the interrupted path", () => {
    authState.user = { id: "user-1", email: "test@example.com" };
    render(<AccountPageClient />);
    expect(replace).toHaveBeenCalledWith("/checkout");
    authState.user = null;
  });
});
