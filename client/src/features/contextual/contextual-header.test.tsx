import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ContextualClusterSelector, ContextualHeader } from "./contextual-header";

describe("contextual presentation", () => {
  it("renders the contextual page header and workout CTA", () => {
    render(<ContextualHeader activeClusterId={4} />);

    expect(screen.getByText("Contextual Learning Mode")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Start Context Workout/i })).toBeTruthy();
  });

  it("forwards cluster selection changes", async () => {
    const user = userEvent.setup();
    const setSelectedClusterId = vi.fn();

    render(
      <ContextualClusterSelector
        activeClusterId={2}
        setSelectedClusterId={setSelectedClusterId}
        clusters={[
          { id: 2, name: "Travel" },
          { id: 5, name: "Food" },
        ]}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "5");
    expect(setSelectedClusterId).toHaveBeenCalledWith(5);
  });
});
