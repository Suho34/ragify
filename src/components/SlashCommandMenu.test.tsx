import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import { useSlashCommand, COMMANDS } from "./SlashCommandMenu";

describe("SlashCommandMenu", () => {
  it("has unique ids for all commands", () => {
    const ids = COMMANDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has required fields for all commands", () => {
    for (const cmd of COMMANDS) {
      expect(cmd).toHaveProperty("id");
      expect(cmd).toHaveProperty("label");
      expect(cmd).toHaveProperty("description");
      expect(cmd).toHaveProperty("prompt");
    }
  });

  it("renders inside PromptInputProvider without error", () => {
    function TestComponent() {
      const { menu } = useSlashCommand();
      return <div data-testid="menu-container">{menu}</div>;
    }
    const { container } = render(
      <PromptInputProvider>
        <TestComponent />
      </PromptInputProvider>
    );
    expect(container.querySelector('[data-testid="menu-container"]')).toBeInTheDocument();
  });
});
