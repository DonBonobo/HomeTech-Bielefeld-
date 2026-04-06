import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";

vi.mock("@/components/shop/home-hero", () => ({
  HomeHero: () => <div>Hero</div>,
}));

vi.mock("@/components/shop/trust-strip", () => ({
  TrustStrip: () => <div>Trust</div>,
}));

vi.mock("@/components/shop/product-card", () => ({
  ProductCard: ({ product }) => <div>{product.title}</div>,
}));

vi.mock("@/components/providers/storefront-provider", () => ({
  useStorefront: () => ({
    visibleProducts: [
      { id: "1", title: "Produkt 1" },
      { id: "2", title: "Produkt 2" },
    ],
  }),
}));

describe("HomePage", () => {
  it("keeps browsing and products on one page without a hero shopping CTA", () => {
    render(<HomePage />);

    expect(screen.getByText("Beliebte Leuchtmittel")).toBeInTheDocument();
    expect(screen.queryByText("Jetzt einkaufen")).not.toBeInTheDocument();
  });
});
