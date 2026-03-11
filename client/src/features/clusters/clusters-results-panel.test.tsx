import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClustersResultsPanel } from "./clusters-results-panel";

describe("ClustersResultsPanel", () => {
  it("shows an empty state when there are no matching clusters", () => {
    render(
      <ClustersResultsPanel
        pageRows={[]}
        currentPage={1}
        totalPages={1}
        totalResults={0}
        updateQuery={vi.fn()}
      />,
    );

    expect(screen.getByText("No clusters found")).toBeTruthy();
  });

  it("renders cluster rows and forwards pagination actions", async () => {
    const user = userEvent.setup();
    const updateQuery = vi.fn();

    render(
      <ClustersResultsPanel
        pageRows={[
          {
            id: 7,
            name: "Travel Basics",
            type: "topic",
            wordCount: 14,
            description: "Common travel phrases",
          },
        ]}
        currentPage={2}
        totalPages={3}
        totalResults={21}
        updateQuery={updateQuery}
      />,
    );

    expect(screen.getAllByText("Travel Basics").length).toBeGreaterThan(0);
    expect(screen.getByText(/21 results/)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Prev" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(updateQuery).toHaveBeenNthCalledWith(1, { page: 1 });
    expect(updateQuery).toHaveBeenNthCalledWith(2, { page: 3 });
  });
});
