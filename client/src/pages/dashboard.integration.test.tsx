import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { QuizDirectionEnum } from "@shared/domain/enums";
import Dashboard from "./dashboard";

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
    data: {
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
    },
    isLoading: false,
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
  it("shows primary dashboard actions and core mode cards", () => {
    render(<Dashboard />);
    expect(screen.getByText("Start Learning")).toBeTruthy();
    expect(screen.getByText("Primary Action")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Resume Weak Words" })).toBeTruthy();
    expect(screen.getByText("Core Modes")).toBeTruthy();
    expect(screen.getByText("Daily Review")).toBeTruthy();
    expect(screen.getByText("Practice by Cluster")).toBeTruthy();
  });
});
