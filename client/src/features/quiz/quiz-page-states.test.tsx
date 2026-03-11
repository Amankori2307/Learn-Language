import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizModeEnum } from "@shared/domain/enums";
import {
  QuizEmptyState,
  QuizFinishedState,
  QuizLoadingState,
  QuizMissingQuestionState,
} from "./quiz-page-states";

vi.mock("@/components/layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe("quiz page states", () => {
  it("renders the loading surface", () => {
    render(<QuizLoadingState />);

    expect(screen.getByText("Preparing your session")).toBeTruthy();
    expect(screen.getByText("Generating your lesson...")).toBeTruthy();
  });

  it("routes restart actions from the empty state", async () => {
    const user = userEvent.setup();
    const startSession = vi.fn();
    const navigate = vi.fn();

    render(
      <QuizEmptyState
        completionMessage="Nothing more to review right now."
        startSession={startSession}
        navigate={navigate}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Daily Revision" }));
    await user.click(screen.getByRole("button", { name: "View Analytics" }));

    expect(startSession).toHaveBeenCalledWith(`/quiz?mode=${QuizModeEnum.DAILY_REVIEW}`);
    expect(navigate).toHaveBeenCalledWith("/analytics");
  });

  it("renders completion CTAs and follow-up recommendations", async () => {
    const user = userEvent.setup();
    const startSession = vi.fn();
    const navigate = vi.fn();

    render(
      <QuizFinishedState
        percentage={80}
        correctCount={8}
        incorrectCount={2}
        clusterId={9}
        recommendedMode={QuizModeEnum.NEW_WORDS}
        recommendedLabel="Start New Words"
        startSession={startSession}
        navigate={navigate}
      />,
    );

    expect(screen.getByText("80%")).toBeTruthy();
    expect(screen.getByText("8")).toBeTruthy();
    expect(screen.getByText(/continue with new words/i)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Start Reinforcement Loop (2 missed)" }));
    await user.click(screen.getByRole("button", { name: "Review Related Cluster Words" }));
    await user.click(screen.getByRole("button", { name: "Start New Words" }));
    await user.click(screen.getByRole("button", { name: "Back to Dashboard" }));

    expect(startSession).toHaveBeenNthCalledWith(1, `/quiz?mode=${QuizModeEnum.WEAK_WORDS}`);
    expect(navigate).toHaveBeenNthCalledWith(1, "/quiz?mode=cluster&clusterId=9");
    expect(startSession).toHaveBeenNthCalledWith(2, `/quiz?mode=${QuizModeEnum.NEW_WORDS}`);
    expect(navigate).toHaveBeenNthCalledWith(2, "/");
  });

  it("supports keyboard navigation on the completion actions", async () => {
    const user = userEvent.setup();
    const startSession = vi.fn();
    const navigate = vi.fn();

    render(
      <QuizFinishedState
        percentage={80}
        correctCount={8}
        incorrectCount={2}
        clusterId={9}
        recommendedMode={QuizModeEnum.NEW_WORDS}
        recommendedLabel="Start New Words"
        startSession={startSession}
        navigate={navigate}
      />,
    );

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Start Reinforcement Loop (2 missed)" }),
    );

    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Review Related Cluster Words" }),
      );
    });

    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Start New Words" }));
    });

    await user.keyboard("{Enter}");
    expect(startSession).toHaveBeenCalledWith(`/quiz?mode=${QuizModeEnum.NEW_WORDS}`);
  });

  it("allows restarting from the missing-question state", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();

    render(<QuizMissingQuestionState navigate={navigate} />);

    await user.click(screen.getByRole("button", { name: "Return Home" }));
    expect(navigate).toHaveBeenCalledWith("/");
  });
});
