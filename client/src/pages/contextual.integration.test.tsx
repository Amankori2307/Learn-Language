import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContextualPage from "./contextual";

const viewModel = vi.fn();

vi.mock("@/components/layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/features/contextual/use-contextual-page-view-model", () => ({
  useContextualPageViewModel: () => viewModel(),
}));

describe("ContextualPage integration", () => {
  beforeEach(() => {
    viewModel.mockReset();
  });

  it("renders an empty surface when no story lines exist", () => {
    viewModel.mockReturnValue({
      setSelectedClusterId: vi.fn(),
      activeClusterId: 2,
      clusters: [{ id: 2, name: "Travel" }],
      storyLines: [],
      isLoading: false,
    });

    render(<ContextualPage />);
    expect(screen.getByText("No contextual lines yet")).toBeTruthy();
  });

  it("renders loading skeleton while contextual content is fetching", () => {
    viewModel.mockReturnValue({
      setSelectedClusterId: vi.fn(),
      activeClusterId: 2,
      clusters: [{ id: 2, name: "Travel" }],
      storyLines: [],
      isLoading: true,
    });

    const { container } = render(<ContextualPage />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders story lines and forwards cluster changes", async () => {
    const user = userEvent.setup();
    const setSelectedClusterId = vi.fn();

    viewModel.mockReturnValue({
      setSelectedClusterId,
      activeClusterId: 2,
      clusters: [
        { id: 2, name: "Travel" },
        { id: 5, name: "Food" },
      ],
      storyLines: [
        {
          originalScript: "నాకు నీళ్లు కావాలి",
          pronunciation: "naaku neellu kaavaali",
          english: "Context hint: I need water",
        },
      ],
      isLoading: false,
    });

    render(<ContextualPage />);

    expect(screen.getByText("Contextual Learning Mode")).toBeTruthy();
    expect(screen.getByText("Context hint: I need water")).toBeTruthy();

    await user.selectOptions(screen.getByRole("combobox"), "5");
    expect(setSelectedClusterId).toHaveBeenCalledWith(5);
  });
});
