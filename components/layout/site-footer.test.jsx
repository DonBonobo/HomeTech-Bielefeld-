import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/layout/site-footer";

describe("SiteFooter", () => {
  it("renders the footer links and legal note", () => {
    render(<SiteFooter />);

    expect(screen.getByRole("link", { name: "Impressum" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kontakt" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Feedback" })).toBeInTheDocument();
    expect(screen.getByText("Alle Rechte vorbehalten. © HomeTech Bielefeld 2025")).toBeInTheDocument();
  });
});
