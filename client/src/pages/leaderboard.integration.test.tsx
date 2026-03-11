import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("renders a loading skeleton while leaderboard data is loading", () => {
    viewModel.mockReturnValue({
      window: "weekly",
      setWindow: vi.fn(),
      entries: [],
      isLoading: true,
      isError: false,
      isFetching: false,
      retry: vi.fn(),
    });

    const { container } = render(<LeaderboardPage />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders a retryable error surface when leaderboard loading fails", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();

    viewModel.mockReturnValue({
      window: "weekly",
      setWindow: vi.fn(),
      entries: [],
      isLoading: false,
      isError: true,
      isFetching: false,
      retry,
    });

    render(<LeaderboardPage />);

    expect(screen.getByText("Failed to load leaderboard")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledTimes(1);
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
    expect(screen.getByRole("button", { name: "Daily" }).className).toContain("w-full");
    expect(screen.getByRole("button", { name: "Daily" }).className).toContain("sm:w-auto");
  });

  it("forwards window changes through the page header", async () => {
    const user = userEvent.setup();
    const setWindow = vi.fn();

    viewModel.mockReturnValue({
      window: "weekly",
      setWindow,
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

    await user.click(screen.getByRole("button", { name: "Daily" }));
    expect(setWindow).toHaveBeenCalledWith("daily");
  });

  it("disables leaderboard window controls while a refetch is pending", () => {
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
      isFetching: true,
      retry: vi.fn(),
    });

    render(<LeaderboardPage />);

    expect((screen.getByRole("button", { name: "Daily" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Weekly" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
