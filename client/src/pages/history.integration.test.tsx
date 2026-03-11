import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuizDirectionEnum } from "@shared/domain/enums";
import HistoryPage from "./history";

const viewModel = vi.fn();

vi.mock("@/components/layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/features/history/use-history-page-view-model", () => ({
  useHistoryPageViewModel: () => viewModel(),
}));

describe("HistoryPage integration", () => {
  beforeEach(() => {
    viewModel.mockReset();
  });

  it("shows empty state when no attempts match filters", () => {
    viewModel.mockReturnValue({
      search: "",
      setSearch: vi.fn(),
      resultFilter: "all",
      setResultFilter: vi.fn(),
      directionFilter: "all",
      setDirectionFilter: vi.fn(),
      sortBy: "newest",
      setSortBy: vi.fn(),
      setPage: vi.fn(),
      filteredAttempts: [],
      currentPage: 1,
      totalPages: 1,
      pageAttempts: [],
      summary: { total: 0, correct: 0, accuracy: 0 },
      applyFilterReset: vi.fn(),
      isLoading: false,
      isError: false,
      isFetching: false,
      refresh: vi.fn(),
      retry: vi.fn(),
    });

    render(<HistoryPage />);

    expect(screen.getByText("No attempts match these filters")).toBeTruthy();
  });

  it("refreshes and renders attempt rows when data is present", async () => {
    const user = userEvent.setup();
    const refresh = vi.fn();

    viewModel.mockReturnValue({
      search: "",
      setSearch: vi.fn(),
      resultFilter: "all",
      setResultFilter: vi.fn(),
      directionFilter: "all",
      setDirectionFilter: vi.fn(),
      sortBy: "newest",
      setSortBy: vi.fn(),
      setPage: vi.fn(),
      filteredAttempts: [
        {
          id: 1,
          isCorrect: true,
          direction: QuizDirectionEnum.SOURCE_TO_TARGET,
          confidenceLevel: 3,
          responseTimeMs: 2400,
          createdAt: "2026-03-10T10:00:00.000Z",
          word: {
            transliteration: "namaste",
            originalScript: "నమస్తే",
            english: "hello",
          },
        },
      ],
      currentPage: 1,
      totalPages: 1,
      pageAttempts: [
        {
          id: 1,
          isCorrect: true,
          direction: QuizDirectionEnum.SOURCE_TO_TARGET,
          confidenceLevel: 3,
          responseTimeMs: 2400,
          createdAt: "2026-03-10T10:00:00.000Z",
          word: {
            transliteration: "namaste",
            originalScript: "నమస్తే",
            english: "hello",
          },
        },
      ],
      summary: { total: 1, correct: 1, accuracy: 100 },
      applyFilterReset: vi.fn(),
      isLoading: false,
      isError: false,
      isFetching: false,
      refresh,
      retry: vi.fn(),
    });

    render(<HistoryPage />);

    expect(screen.getByText("namaste (నమస్తే)")).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Refresh" }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
