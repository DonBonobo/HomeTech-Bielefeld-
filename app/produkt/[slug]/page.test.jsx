import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductPage from "@/app/produkt/[slug]/page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "philips-hue-white-ambiance-e27-1100" }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: (props) => <img alt={props.alt} src={props.src} />,
}));

vi.mock("@/components/providers/storefront-provider", () => ({
  useStorefront: () => ({
    getProduct: () => ({
      id: "white-ambiance-e27-1100",
      slug: "philips-hue-white-ambiance-e27-1100",
      title: "Philips Hue White Ambiance E27 1100",
      categorySlug: "leuchtmittel",
      category: "Leuchtmittel",
      spec: "E27 · 1100 lm",
      stockLabel: "Auf Lager",
      short: "Variables Weißlicht für Alltag und Abend.",
      priceCents: 2499,
      compatibility: ["Matter", "Apple Home"],
      gallery: [
        "/assets/products/philips-hue-white-ambiance-e27-1100.png",
        "/assets/products/box-shots/philips-hue-white-ambiance-e27-1100-box.png",
      ],
    }),
  }),
}));

vi.mock("@/components/shop/add-to-cart-button", () => ({
  AddToCartButton: () => <button>In den Warenkorb</button>,
}));

vi.mock("@/components/shop/auth-entry-card", () => ({
  AuthEntryCard: () => <div>Anmelden</div>,
}));

describe("ProductPage", () => {
  it("does not render the removed detail sections", () => {
    render(<ProductPage />);

    expect(screen.queryByText("Klar aufgebaut statt überladen")).not.toBeInTheDocument();
    expect(screen.queryByText("Passend dazu")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Produktbild vergrößern" })).toBeInTheDocument();
  });
});
