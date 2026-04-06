import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductGallery } from "@/components/shop/product-gallery";

vi.mock("next/image", () => ({
  default: (props) => <img alt={props.alt} src={props.src} />,
}));

describe("ProductGallery", () => {
  const gallery = [
    "/assets/products/philips-hue-white-ambiance-e27-1100.png",
    "/assets/products/box-shots/philips-hue-white-ambiance-e27-1100-box.png",
  ];

  it("switches the active image through the thumbnails", () => {
    render(<ProductGallery title="Hue White Ambiance" gallery={gallery} />);

    fireEvent.click(screen.getByRole("button", { name: "Bild 2 anzeigen" }));

    expect(screen.getByRole("button", { name: "Bild 2 anzeigen" })).toHaveClass("is-active");
  });

  it("opens zoom on the main image", () => {
    render(<ProductGallery title="Hue White Ambiance" gallery={gallery} />);

    fireEvent.click(screen.getByRole("button", { name: "Produktbild vergrößern" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
