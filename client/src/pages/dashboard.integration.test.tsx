import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuizDirectionEnum } from "@shared/domain/enums";
import Dashboard from "./dashboard";

let statsData = {
  totalWords: 120,
  mastered: 24,
  learning: 40,
  weak: 8,
  streak: 5,
  xp: 230,
  recognitionAccuracy: 72,
  recallAccuracy: 64,
  sourceToTargetStrength: 0.51,
  targetToSourceStrength: 0.58,
  recommendedDirection: QuizDirectionEnum.SOURCE_TO_TARGET,
};
let statsLoading = false;
let statsError = false;
const refetch = vi.fn();

vi.mock("@/components/layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "u-1", firstName: "Aman", email: "aman@example.com" },
  }),
}));

vi.mock("@/hooks/use-quiz", () => ({
  useStats: () => ({
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    refetch,
  }),
  useLearningInsights: () => ({
    data: {
      clusters: [
        { clusterId: 1, name: "travel", wordCount: 20, attempts: 30, accuracy: 53.3 },
        { clusterId: 2, name: "food", wordCount: 16, attempts: 22, accuracy: 78.2 },
      ],
      categories: [{ category: "verb", attempts: 40, accuracy: 81.5 }],
      weakWords: [
        {
          wordId: 10,
          originalScript: "రా",
          transliteration: "raa",
          english: "come",
          wrongCount: 6,
          masteryLevel: 1,
        },
      ],
      strongWords: [],
    },
  }),
}));

describe("Dashboard integration", () => {
  beforeEach(() => {
    statsLoading = false;
    statsError = false;
    refetch.mockClear();
    statsData = {
      totalWords: 120,
      mastered: 24,
      learning: 40,
      weak: 8,
      streak: 5,
      xp: 230,
      recognitionAccuracy: 72,
      recallAccuracy: 64,
      sourceToTargetStrength: 0.51,
      targetToSourceStrength: 0.58,
      recommendedDirection: QuizDirectionEnum.SOURCE_TO_TARGET,
    };
  });

  it("renders loading skeleton while dashboard stats are loading", () => {
    statsLoading = true;

    const { container } = render(<Dashboard />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders retryable error state when dashboard stats fail to load", async () => {
    const user = userEvent.setup();
    statsError = true;

    render(<Dashboard />);

    expect(screen.getByText("Could not load dashboard")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("shows primary dashboard actions and core mode cards", () => {
    render(<Dashboard />);
    expect(screen.getByText("Start Learning")).toBeTruthy();
    expect(screen.getByText("Primary Action")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Resume Weak Words" })).toBeTruthy();
    expect(screen.getByText("Core Modes")).toBeTruthy();
    expect(screen.getByText("Daily Review")).toBeTruthy();
    expect(screen.getByText("Practice by Cluster")).toBeTruthy();
  });

  it("defaults the primary action to daily review when there are no weak words", () => {
    statsData = {
      ...statsData,
      weak: 0,
    };

    render(<Dashboard />);

    expect(screen.getByRole("button", { name: "Start Daily Review" })).toBeTruthy();
  });

  it("renders zero-data dashboard stats as a valid default success state", () => {
    statsData = {
      totalWords: 0,
      mastered: 0,
      learning: 0,
      weak: 0,
      streak: 0,
      xp: 0,
      recognitionAccuracy: 0,
      recallAccuracy: 0,
      sourceToTargetStrength: 0.5,
      targetToSourceStrength: 0.5,
      recommendedDirection: QuizDirectionEnum.SOURCE_TO_TARGET,
    };

    render(<Dashboard />);

    expect(screen.getByText("0 day streak • 0 mastered words")).toBeTruthy();
    expect(screen.getByText("Total XP")).toBeTruthy();
    expect(screen.getByText("Words Mastered")).toBeTruthy();
    expect(screen.getByText("Learning")).toBeTruthy();
    expect(screen.getByText("Needs Review")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start Daily Review" })).toBeTruthy();
  });
});
