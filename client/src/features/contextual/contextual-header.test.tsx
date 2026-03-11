import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ContextualClusterSelector, ContextualHeader } from "./contextual-header";

describe("contextual presentation", () => {
  it("renders the contextual page header and workout CTA", () => {
    const { container } = render(<ContextualHeader activeClusterId={4} />);

    expect(screen.getByText("Contextual Learning Mode")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Start Context Workout/i })).toBeTruthy();
    expect(container.firstElementChild?.className.includes("flex-col")).toBe(true);
    expect(container.firstElementChild?.className.includes("sm:flex-row")).toBe(true);
    expect(
      (screen.getByRole("button", { name: /Start Context Workout/i }) as HTMLButtonElement).className.includes("w-full"),
    ).toBe(true);
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

  it("keeps the selector card mobile-safe", () => {
    const { container } = render(
      <ContextualClusterSelector
        activeClusterId={2}
        setSelectedClusterId={vi.fn()}
        clusters={[
          { id: 2, name: "Travel" },
          { id: 5, name: "Food" },
        ]}
      />,
    );

    expect(container.firstElementChild?.className.includes("p-4")).toBe(true);
  });
});
