import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "@/components/layout/header";

const authState = {
  isAdmin: false,
};

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: (props) => <img alt={props.alt} src={props.src} />,
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => authState,
}));

vi.mock("@/components/providers/cart-provider", () => ({
  useCart: () => ({ cartItems: [] }),
}));

vi.mock("@/components/providers/storefront-provider", () => ({
  useStorefront: () => ({
    categories: [
      { id: "1", slug: "leuchtmittel", label: "Leuchtmittel", enabled: true },
    ],
  }),
}));

describe("Header", () => {
  it("hides admin entry for regular users", () => {
    authState.isAdmin = false;
    render(<Header />);
    expect(screen.queryByLabelText("Admin")).not.toBeInTheDocument();
  });

  it("shows admin entry for admin users", () => {
    authState.isAdmin = true;
    render(<Header />);
    expect(screen.getByLabelText("Admin")).toBeInTheDocument();
    authState.isAdmin = false;
  });
});
