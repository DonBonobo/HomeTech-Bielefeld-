import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountPageClient } from "@/components/account/account-page";

const replace = vi.fn();
const orderEq = vi.fn(() => ({ order: vi.fn(() => ({ limit: vi.fn(async () => ({ data: [], error: { message: "missing-table" } })) })) }));

const authState = {
  user: null,
  profile: null,
  role: "customer",
  isAdmin: false,
  ready: true,
  authEvent: null,
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: orderEq,
      })),
    })),
  },
  signInWithGoogle: vi.fn(async () => ({ data: {}, error: null })),
  signInWithPassword: vi.fn(async () => ({ data: {}, error: null })),
  signUpWithEmail: vi.fn(async () => ({ data: {}, error: null })),
  requestPasswordReset: vi.fn(async () => ({ data: {}, error: null })),
  updatePassword: vi.fn(async () => ({ data: {}, error: null })),
  exchangeCodeForSession: vi.fn(async () => ({ data: {}, error: null })),
  getPendingRedirect: vi.fn(() => "/checkout"),
  clearPendingRedirect: vi.fn(),
  signOut: vi.fn(async () => {}),
};

let params = "next=%2Fcheckout";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(params),
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => authState,
}));

describe("AccountPage", () => {
  beforeEach(() => {
    replace.mockReset();
    params = "next=%2Fcheckout";
    authState.user = null;
    authState.profile = null;
    authState.role = "customer";
    authState.isAdmin = false;
    authState.authEvent = null;
    authState.ready = true;
    authState.supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(async () => ({ data: [], error: { message: "missing-table" } })),
            })),
          })),
        })),
      })),
    };
    authState.signInWithGoogle.mockClear();
    authState.signInWithPassword.mockClear();
    authState.signUpWithEmail.mockClear();
    authState.requestPasswordReset.mockClear();
    authState.updatePassword.mockClear();
  });

  it("renders Google and e-mail auth actions", () => {
    render(<AccountPageClient />);

    expect(screen.getByRole("button", { name: "Mit Google fortfahren" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mit E-Mail anmelden" })).toBeInTheDocument();
  });

  it("shows a loading state before auth hydration finishes", () => {
    authState.ready = false;
    render(<AccountPageClient />);
    expect(screen.getByText("Sitzung wird geprüft")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mit E-Mail anmelden" })).not.toBeInTheDocument();
  });

  it("starts Google sign-in with the current redirect path", async () => {
    render(<AccountPageClient />);

    fireEvent.click(screen.getByRole("button", { name: "Mit Google fortfahren" }));

    await waitFor(() => {
      expect(authState.signInWithGoogle).toHaveBeenCalledWith("/checkout");
    });
  });

  it("starts password sign-in with redirect continuity", async () => {
    render(<AccountPageClient />);

    fireEvent.change(screen.getByPlaceholderText("E-Mail-Adresse"), { target: { value: "kunde@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Passwort"), { target: { value: "passwort-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Mit E-Mail anmelden" }));

    await waitFor(() => {
      expect(authState.signInWithPassword).toHaveBeenCalledWith("kunde@example.com", "passwort-123", "/checkout");
    });
  });

  it("starts sign-up with password and confirmation", async () => {
    params = "next=%2Fprodukt%2Fphilips-hue-white-e14-kerze-470&mode=registrieren";
    render(<AccountPageClient />);

    fireEvent.change(screen.getByPlaceholderText("E-Mail-Adresse"), { target: { value: "neu@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Passwort festlegen"), { target: { value: "passwort-123" } });
    fireEvent.change(screen.getByPlaceholderText("Passwort wiederholen"), { target: { value: "passwort-123" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Konto erstellen" })[1]);

    await waitFor(() => {
      expect(authState.signUpWithEmail).toHaveBeenCalledWith("neu@example.com", "passwort-123", "/produkt/philips-hue-white-e14-kerze-470");
    });
  });

  it("starts password reset request", async () => {
    params = "next=%2Fcheckout&mode=zuruecksetzen";
    render(<AccountPageClient />);

    fireEvent.change(screen.getByPlaceholderText("E-Mail-Adresse"), { target: { value: "kunde@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Link zum Zurücksetzen senden" }));

    await waitFor(() => {
      expect(authState.requestPasswordReset).toHaveBeenCalledWith("kunde@example.com", "/checkout");
    });
  });

  it("shows admin entry only for admin users", () => {
    authState.user = { id: "user-1", email: "admin@example.com" };
    authState.profile = { full_name: "Admin" };
    authState.role = "admin";
    authState.isAdmin = true;
    params = "next=%2Fkonto";

    render(<AccountPageClient />);

    expect(screen.getByRole("link", { name: "Admin" })).toBeInTheDocument();
  });

  it("shows orders first for signed-in users", async () => {
    authState.user = { id: "user-1", email: "test@example.com" };
    params = "next=%2Fkonto";
    authState.supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(async () => ({
                data: [{ id: "12345678-abcd", status: "pending", total_cents: 2499, created_at: "2026-04-06T00:00:00.000Z" }],
                error: null,
              })),
            })),
          })),
        })),
      })),
    };

    render(<AccountPageClient />);
    expect(screen.getByText("Letzte Bestellungen")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Offen")).toBeInTheDocument();
    });
  });

  it("shows an elegant empty orders state", async () => {
    authState.user = { id: "user-1", email: "test@example.com" };
    params = "next=%2Fkonto";

    render(<AccountPageClient />);

    await waitFor(() => {
      expect(screen.getByText("Noch keine Bestellungen")).toBeInTheDocument();
      expect(screen.getByText("Deine letzten Einkäufe erscheinen hier.")).toBeInTheDocument();
    });
  });

  it("redirects signed-in users back to the interrupted path", () => {
    authState.user = { id: "user-1", email: "test@example.com" };
    render(<AccountPageClient />);
    expect(replace).toHaveBeenCalledWith("/checkout");
  });

  it("exchanges auth codes from the callback url", async () => {
    params = "next=%2Fcheckout&code=abc123";
    render(<AccountPageClient />);

    await waitFor(() => {
      expect(authState.exchangeCodeForSession).toHaveBeenCalled();
    });
  });
});
