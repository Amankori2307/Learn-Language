import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BookOpen, Flame, Target, TriangleAlert } from "lucide-react";
import { DashboardOverview } from "./dashboard-overview";

describe("DashboardOverview", () => {
  it("renders the primary action, bucket cards, and core modes", () => {
    const { container } = render(
      <DashboardOverview
        userName="Aman"
        stats={{ streak: 5, mastered: 24, xp: 230 }}
        primaryMode="weak"
        primaryLabel="Resume Weak Words"
        bucketCards={[
          {
            key: "learning",
            label: "Learning",
            value: 12,
            meaning: "Words in progress",
            improve: "Review them daily.",
            icon: BookOpen,
          },
          {
            key: "needs_review",
            label: "Needs Review",
            value: 4,
            meaning: "Words due soon",
            improve: "Clear them first.",
            icon: TriangleAlert,
          },
        ]}
        coreActions={[
          {
            title: "Daily Review",
            description: "Review your due words.",
            count: 8,
            href: "/quiz?mode=review",
            icon: Flame,
          },
          {
            title: "Practice by Cluster",
            description: "Train a focused topic.",
            count: 3,
            href: "/clusters",
            icon: Target,
          },
        ]}
      />,
    );

    expect(screen.getByText("Welcome back, Aman. Continue with the next recommended session.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Resume Weak Words" })).toBeTruthy();
    expect(screen.getByText(/5 day streak/)).toBeTruthy();
    expect(screen.getByText(/24 mastered words/)).toBeTruthy();
    expect(screen.getByText("Total XP")).toBeTruthy();
    expect(screen.getByText("Learning")).toBeTruthy();
    expect(screen.getByText("Needs Review")).toBeTruthy();
    expect(screen.getByText("Core Modes")).toBeTruthy();
    expect(screen.getByText("Daily Review")).toBeTruthy();
    expect(screen.getByText("Practice by Cluster")).toBeTruthy();
    expect(
      container.querySelector(".sm\\:min-w-\\[var\\(--action-cluster-button-min-width\\)\\]"),
    ).toBeTruthy();
    expect(
      container.querySelector(".min-h-\\[var\\(--surface-dashboard-card-min-height\\)\\]"),
    ).toBeTruthy();
  });
});
