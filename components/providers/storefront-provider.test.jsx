import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider } from "@/components/providers/auth-provider";
import { StorefrontProvider, useStorefront } from "@/components/providers/storefront-provider";

function StorefrontHarness() {
  const { categories, upsertCategory, getCategoryProducts } = useStorefront();

  return (
    <div>
      <span data-testid="category-count">{categories.length}</span>
      <span data-testid="hubs-products">{getCategoryProducts("hubs").length}</span>
      <button type="button" onClick={() => upsertCategory({ id: categories[0].id, label: "Leuchten", enabled: true, position: 0 })}>
        rename
      </button>
      <span data-testid="first-label">{categories[0]?.label}</span>
    </div>
  );
}

describe("StorefrontProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("loads dynamic categories and keeps empty categories valid", async () => {
    render(
      <AuthProvider>
        <StorefrontProvider>
          <StorefrontHarness />
        </StorefrontProvider>
      </AuthProvider>
    );

    expect(screen.getByTestId("category-count")).toHaveTextContent("3");
    expect(screen.getByTestId("hubs-products")).toHaveTextContent("0");
    fireEvent.click(screen.getByRole("button", { name: "rename" }));
    expect(screen.getByTestId("first-label")).toHaveTextContent("Leuchten");
  });
});
