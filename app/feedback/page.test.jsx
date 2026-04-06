import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FeedbackPage from "@/app/feedback/page";

describe("FeedbackPage", () => {
  it("renders the anonymous feedback form", () => {
    render(<FeedbackPage />);
    expect(screen.getByText("Rückmeldung senden")).toBeInTheDocument();
  });

  it("accepts anonymous feedback", () => {
    window.localStorage.clear();
    render(<FeedbackPage />);

    fireEvent.change(screen.getByPlaceholderText("Dein Feedback"), { target: { value: "Alles gut." } });
    fireEvent.click(screen.getByRole("button", { name: "Feedback senden" }));

    expect(screen.getByText("Danke für dein Feedback.")).toBeInTheDocument();
  });
});
