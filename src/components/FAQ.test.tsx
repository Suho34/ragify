import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FAQ from "./FAQ";

afterEach(cleanup);

describe("FAQ", () => {
  it("renders all questions", () => {
    render(<FAQ />);
    expect(screen.getByRole("heading", { name: /questions/i })).toBeInTheDocument();
    expect(screen.getByText(/file types/i)).toBeInTheDocument();
    expect(screen.getByText(/accurate/i)).toBeInTheDocument();
    expect(screen.getByText(/multiple people/i)).toBeInTheDocument();
  });

  it("toggles answer on click", async () => {
    const user = userEvent.setup();
    render(<FAQ />);
    const buttons = screen.getAllByRole("button");
    const fileTypesBtn = buttons.find((b) => b.textContent?.includes("file types"));
    expect(fileTypesBtn).toBeTruthy();
    await user.click(fileTypesBtn!);

    expect(screen.getByText(/PDF, DOCX, TXT/i)).toBeInTheDocument();
  });
});
