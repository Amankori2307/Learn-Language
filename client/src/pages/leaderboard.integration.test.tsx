import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LeaderboardPage from "./leaderboard";

const viewModel = vi.fn();

vi.mock("@/components/layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/features/analytics/use-leaderboard-page-view-model", () => ({
  LEADERBOARD_WINDOW_OPTIONS: [
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "all_time", label: "All Time" },
  ],
  useLeaderboardPageViewModel: () => viewModel(),
}));

describe("LeaderboardPage integration", () => {
  beforeEach(() => {
    viewModel.mockReset();
  });

  it("renders an empty state when no entries are available", () => {
    viewModel.mockReturnValue({
      window: "weekly",
      setWindow: vi.fn(),
      entries: [],
      isLoading: false,
      isError: false,
      isFetching: false,
      retry: vi.fn(),
    });

    render(<LeaderboardPage />);

    expect(screen.getByText("No leaderboard data yet")).toBeTruthy();
  });

  it("renders leaderboard entries when data is available", () => {
    viewModel.mockReturnValue({
      window: "weekly",
      setWindow: vi.fn(),
      entries: [
        {
          userId: "u-1",
          rank: 1,
          firstName: "Aman",
          lastName: "K",
          email: "aman@example.com",
          profileImageUrl: null,
          attempts: 32,
          xp: 420,
          streak: 8,
          accuracy: 84,
        },
      ],
      isLoading: false,
      isError: false,
      isFetching: false,
      retry: vi.fn(),
    });

    render(<LeaderboardPage />);

    expect(screen.getAllByText(/Aman K/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/420 XP/i).length).toBeGreaterThan(0);
  });
});
