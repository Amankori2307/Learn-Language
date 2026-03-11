import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClustersPage from "./clusters";

const viewModel = vi.fn();

vi.mock("@/components/layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/features/clusters/use-clusters-page-view-model", () => ({
  useClustersPageViewModel: () => viewModel(),
}));

describe("ClustersPage integration", () => {
  beforeEach(() => {
    viewModel.mockReset();
  });

  it("renders loading skeleton while clusters are loading", () => {
    viewModel.mockReturnValue({
      query: "",
      typeFilter: "all",
      sortBy: "words_desc",
      clusterTypes: ["all"],
      updateQuery: vi.fn(),
      topCluster: null,
      totalWords: 0,
      nonEmptyClusters: 0,
      totalResults: 0,
      totalPages: 1,
      currentPage: 1,
      pageRows: [],
      isLoading: true,
      isError: false,
      retry: vi.fn(),
    });

    const { container } = render(<ClustersPage />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders cluster rows and forwards filter updates", async () => {
    const user = userEvent.setup();
    const updateQuery = vi.fn();

    viewModel.mockReturnValue({
      query: "",
      typeFilter: "all",
      sortBy: "words_desc",
      clusterTypes: ["all", "topic"],
      updateQuery,
      topCluster: { id: 1, name: "Travel", wordCount: 14 },
      totalWords: 120,
      nonEmptyClusters: 18,
      totalResults: 2,
      totalPages: 1,
      currentPage: 1,
      pageRows: [
        {
          id: 1,
          name: "Travel",
          type: "topic",
          wordCount: 14,
          description: "Common travel words",
        },
      ],
      isLoading: false,
      isError: false,
      retry: vi.fn(),
    });

    render(<ClustersPage />);

    expect(screen.getByText("Cluster Practice")).toBeTruthy();
    expect(screen.getByText("Travel")).toBeTruthy();

    await user.type(screen.getByLabelText("Search"), "go");
    expect(updateQuery).toHaveBeenCalled();
  });

  it("renders empty-state messaging when filters return no clusters", () => {
    viewModel.mockReturnValue({
      query: "missing",
      typeFilter: "all",
      sortBy: "words_desc",
      clusterTypes: ["all", "topic"],
      updateQuery: vi.fn(),
      topCluster: null,
      totalWords: 120,
      nonEmptyClusters: 18,
      totalResults: 0,
      totalPages: 1,
      currentPage: 1,
      pageRows: [],
      isLoading: false,
      isError: false,
      retry: vi.fn(),
    });

    render(<ClustersPage />);

    expect(screen.getByText("No clusters found")).toBeTruthy();
    expect(
      screen.getByText("No clusters match the current search and filter combination."),
    ).toBeTruthy();
  });

  it("renders retryable error state when clusters request fails", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();

    viewModel.mockReturnValue({
      query: "",
      typeFilter: "all",
      sortBy: "words_desc",
      clusterTypes: ["all"],
      updateQuery: vi.fn(),
      topCluster: null,
      totalWords: 0,
      nonEmptyClusters: 0,
      totalResults: 0,
      totalPages: 1,
      currentPage: 1,
      pageRows: [],
      isLoading: false,
      isError: true,
      retry,
    });

    render(<ClustersPage />);

    expect(screen.getByText("Failed to load clusters")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
